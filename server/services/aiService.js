// server/services/aiService.js

import axios from "axios";

import HeartRate from "../models/heartRateModel.js";
import SleepSession from "../models/sleepSessionModel.js";
import Step from "../models/stepsModel.js";
import ExerciseSession from "../models/exerciseModel.js";
import BloodPressure from "../models/bloodPressureModels.js";
import SpO2 from "../models/spo2Model.js"; // ⬅️ NEW

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8001";
const SEQ_LEN = 21; // must match your FastAPI SEQ_LEN

//-----------------------------------------------------
// Helper: format a date into YYYY-MM-DD
//-----------------------------------------------------
function dayKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

//-----------------------------------------------------
// Helper: ensure one "bucket" per day (now includes SpO2)
//-----------------------------------------------------
function ensureDay(
  dayKeyStr,
  buckets,
  hrDocs,
  sleepDocs,
  stepDocs,
  bpDocs,
  exerciseDocs,
  spo2Docs
) {
  if (!buckets[dayKeyStr]) {
    const dayHR = hrDocs.filter(
      (h) => dayKey(h.timestamp || h.time || h.createdAt) === dayKeyStr
    );

    const daySleep = sleepDocs.filter(
      (s) => dayKey(s.startTime || s.start || s.createdAt) === dayKeyStr
    );

    const daySteps = stepDocs.filter(
      (st) => dayKey(st.startTime || st.date || st.timestamp || st.createdAt) === dayKeyStr
    );

    const dayBP = bpDocs.filter(
      (b) => dayKey(b.timestamp || b.time || b.createdAt) === dayKeyStr
    );

    const dayExercise = exerciseDocs.filter(
      (e) => dayKey(e.startTime || e.start || e.createdAt) === dayKeyStr
    );

    const daySpO2 = spo2Docs.filter(
      (o) => dayKey(o.time || o.lastModifiedTime || o.createdAt) === dayKeyStr
    );

    buckets[dayKeyStr] = {
      hr: dayHR,
      sleep: daySleep,
      steps: daySteps,
      bp: dayBP,
      exercise: dayExercise,
      spo2: daySpO2, // ⬅️ NEW
    };
  }

  return buckets[dayKeyStr];
}

//-----------------------------------------------------
// Per-day aggregation helpers
//-----------------------------------------------------
function summarizeHR(dayHR) {
  if (!dayHR || dayHR.length === 0) {
    return {
      avg_hr: 0,
      min_hr: 0,
      max_hr: 0,
    };
  }

  let sum = 0;
  let min = Infinity;
  let max = -Infinity;

  for (const h of dayHR) {
    const v = h.value ?? h.heartRate ?? h.hr ?? 0;
    sum += v;
    if (v < min) min = v;
    if (v > max) max = v;
  }

  const avg = sum / dayHR.length;

  return {
    avg_hr: avg,
    min_hr: min,
    max_hr: max,
  };
}

function summarizeSleep(daySleep) {
  if (!daySleep || daySleep.length === 0) {
    return {
      total_sleep_hours: 0,
      sleep_session_count: 0,
    };
  }

  let totalMs = 0;
  for (const s of daySleep) {
    const start = new Date(s.startTime || s.start);
    const end = new Date(s.endTime || s.end);
    const diff = end - start;
    if (!Number.isNaN(diff) && diff > 0) {
      totalMs += diff;
    }
  }

  const hours = totalMs / (1000 * 60 * 60);

  return {
    total_sleep_hours: hours,
    sleep_session_count: daySleep.length,
  };
}

function summarizeSteps(daySteps) {
  if (!daySteps || daySteps.length === 0) {
    return {
      total_steps: 0,
    };
  }

  let total = 0;
  for (const st of daySteps) {
    const v = st.steps ?? st.value ?? 0;
    total += v;
  }
  return {
    total_steps: total,
  };
}

function summarizeBP(dayBP) {
  if (!dayBP || dayBP.length === 0) {
    return {
      avg_systolic: 0,
      avg_diastolic: 0,
    };
  }

  let systolicSum = 0;
  let diastolicSum = 0;
  let count = 0;

  for (const b of dayBP) {
    const sys = b.systolic ?? b.sys ?? 0;
    const dia = b.diastolic ?? b.dia ?? 0;
    systolicSum += sys;
    diastolicSum += dia;
    count++;
  }

  return {
    avg_systolic: systolicSum / count,
    avg_diastolic: diastolicSum / count,
  };
}

function summarizeExercise(dayExercise) {
  if (!dayExercise || dayExercise.length === 0) {
    return {
      exercise_minutes: 0,
      exercise_session_count: 0,
    };
  }

  let totalMinutes = 0;

  for (const ex of dayExercise) {
    if (ex.durationMinutes != null) {
      totalMinutes += ex.durationMinutes;
    } else if (ex.duration != null) {
      totalMinutes += ex.duration / 60;
    } else if (ex.startTime && ex.endTime) {
      const start = new Date(ex.startTime);
      const end = new Date(ex.endTime);
      const diff = end - start;
      if (!Number.isNaN(diff) && diff > 0) {
        totalMinutes += diff / (1000 * 60);
      }
    }
  }

  return {
    exercise_minutes: totalMinutes,
    exercise_session_count: dayExercise.length,
  };
}

// ⬇️ NEW: SpO2 summarizer
function summarizeSpO2(daySpO2) {
  if (!daySpO2 || daySpO2.length === 0) {
    return {
      spo2_mean: 0,
      spo2_min: 0,
      spo2_max: 0,
    };
  }

  let sum = 0;
  let min = Infinity;
  let max = -Infinity;

  for (const o of daySpO2) {
    const v = o.percentage ?? 0;
    sum += v;
    if (v < min) min = v;
    if (v > max) max = v;
  }

  return {
    spo2_mean: sum / daySpO2.length,
    spo2_min: min,
    spo2_max: max,
  };
}

//-----------------------------------------------------
// Build 21 days of features for the AI model
// → returns "days" array matching FastAPI DayData
//-----------------------------------------------------
export async function buildDailyFeatures(userId, seqLen = SEQ_LEN) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date(end);
  start.setDate(start.getDate() - (seqLen - 1));
  start.setHours(0, 0, 0, 0);

  console.log("[AI] buildDailyFeatures for user:", userId);
  console.log("[AI] Window:", start.toISOString(), "→", end.toISOString());

  // Fetch docs from Mongo
  const hrDocs = await HeartRate.find({
    user: userId,
    createdAt: { $gte: start, $lte: end },
  }).lean();

  console.log("[AI] Fetched HR docs count:", hrDocs.length);
  console.log("[AI] HR Docs:", JSON.stringify(hrDocs, null, 2));

  const sleepDocs = await SleepSession.find({
    user: userId,
    startTime: { $gte: start, $lte: end },
  }).lean();
  console.log("[AI] Fetched Sleep docs:", sleepDocs.length);

  const stepDocs = await Step.find({
    user: userId,
    startTime: { $gte: start, $lte: end },
  }).lean();
  console.log("[AI] Fetched Steps docs:", stepDocs.length);

  const bpDocs = await BloodPressure.find({
    user: userId,
    timestamp: { $gte: start, $lte: end },
  }).lean();
  console.log("[AI] Fetched BP docs:", bpDocs.length);

  const exerciseDocs = await ExerciseSession.find({
    user: userId,
    startTime: { $gte: start, $lte: end },
  }).lean();
  console.log("[AI] Fetched Exercise docs:", exerciseDocs.length);

  const spo2Docs = await SpO2.find({
    user: userId,
    lastModifiedTime: { $gte: start, $lte: end },
  }).lean();
  console.log("[AI] Fetched SpO2 docs:", spo2Docs.length);

  const buckets = {};
  const cursor = new Date(start);

  while (cursor <= end) {
    const keyStr = dayKey(cursor);
    ensureDay(
      keyStr,
      buckets,
      hrDocs,
      sleepDocs,
      stepDocs,
      bpDocs,
      exerciseDocs,
      spo2Docs
    );
    cursor.setDate(cursor.getDate() + 1);
  }

  const allDays = Object.keys(buckets).sort();

  if (allDays.length === 0) {
    console.log("[AI] No day buckets created.");
    return {
      insufficientData: true,
      message: "No data available to build daily features.",
      days: null,
    };
  }

  const daysPayload = [];

  for (const day of allDays) {
    const bucket = buckets[day];

    const hrSummary = summarizeHR(bucket.hr);
    const sleepSummary = summarizeSleep(bucket.sleep);
    const stepSummary = summarizeSteps(bucket.steps);
    const bpSummary = summarizeBP(bucket.bp);
    const exerciseSummary = summarizeExercise(bucket.exercise);
    const spo2Summary = summarizeSpO2(bucket.spo2); // ⬅️ NEW

    const dayData = {
      hr_mean: hrSummary.avg_hr,
      hr_min: hrSummary.min_hr,
      hr_max: hrSummary.max_hr,

      spo2_mean: spo2Summary.spo2_mean,
      spo2_min: spo2Summary.spo2_min,
      spo2_max: spo2Summary.spo2_max,

      sleep_hours: sleepSummary.total_sleep_hours,
      sleep_score: null,

      steps_total: stepSummary.total_steps,
      exercise_minutes: exerciseSummary.exercise_minutes,

      bp_sys_mean: bpSummary.avg_systolic,
      bp_dia_mean: bpSummary.avg_diastolic,

      stress_score: null,
    };

    daysPayload.push(dayData);
  }

  const trimmedDays = daysPayload.slice(-seqLen);

  if (trimmedDays.length < seqLen) {
    console.log(
      "[AI] Not enough days. Needed:",
      seqLen,
      "but have:",
      trimmedDays.length
    );
    return {
      insufficientData: true,
      message: `Insufficient days of data. Need ${SEQ_LEN} days, only have ${trimmedDays.length}.`,
      days: null,
    };
  }

  console.log("[AI] Built days payload length:", trimmedDays.length);

  return {
    insufficientData: false,
    message: null,
    days: trimmedDays,
  };
}

//-----------------------------------------------------
// Call FastAPI model → POST /predict
//-----------------------------------------------------
async function callInsomniaModel(userId, days) {
  const url = `${AI_SERVICE_URL}/predict`;
  console.log("[AI] Calling FastAPI model at:", url);

  const resp = await axios.post(url, {
    person_id: userId,
    days,
  });

  return resp.data; // { person_id, insomnia_risk, message }
}

//-----------------------------------------------------
// Public function used by controller
//-----------------------------------------------------
export async function getInsomniaRisk(userId) {
  try {
    console.log("[AI] getInsomniaRisk for user:", userId);

    const featureResult = await buildDailyFeatures(userId, SEQ_LEN);

    if (featureResult.insufficientData || !featureResult.days) {
      console.log("[AI] Insufficient data for user:", userId);
      return {
        insufficientData: true,
        message:
          featureResult.message ||
          `Insufficient wearable data to compute insomnia risk for the last ${SEQ_LEN} days.`,
        risk: null,
      };
    }

    const modelResp = await callInsomniaModel(userId, featureResult.days);

    const risk = modelResp.insomnia_risk;

    if (risk == null) {
      console.error("[AI] Model did not return 'insomnia_risk':", modelResp);
      return {
        insufficientData: true,
        message:
          "AI model did not return a valid insomnia risk score. Please check the AI service.",
        risk: null,
      };
    }

    console.log("[AI] Model risk for user", userId, "=", risk);

    return {
      insufficientData: false,
      message: modelResp.message || null,
      risk,
    };
  } catch (err) {
    console.error("[AI] Error in getInsomniaRisk:", err);
    return {
      insufficientData: true,
      message: "An error occurred while computing insomnia risk.",
      risk: null,
    };
  }
}

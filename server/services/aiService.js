// server/services/aiService.js

import axios from "axios";

import HeartRate from "../models/heartRateModel.js";
import SleepSession from "../models/sleepSessionModel.js";
import Step from "../models/stepsModel.js";
import ExerciseSession from "../models/exerciseModel.js";
import BloodPressure from "../models/bloodPressureModels.js";
import SpO2 from "../models/spo2Model.js"; // <- SpO2 values

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
// Build 21 days of features for the AI model
//-----------------------------------------------------
export async function buildDailyFeatures(userId, seqLen = SEQ_LEN) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date(end);
  start.setDate(start.getDate() - (seqLen - 1));

  const perDay = {};

  function ensureDay(key) {
    if (!perDay[key]) {
      perDay[key] = {
        hr_samples: [],
        sleep_minutes: 0,
        steps_total: 0,
        exercise_ms: 0,
        bp_sys_values: [],
        bp_dia_values: [],
        spo2_values: [], // SpO2 percentages
      };
    }
    return perDay[key];
  }

  //-----------------------------------------------------
  // HEART RATE
  //-----------------------------------------------------
  const hrDocs = await HeartRate.find({
    user: userId,
    startTime: { $gte: start, $lte: end },
  });

  for (const rec of hrDocs) {
    const k = dayKey(rec.startTime);
    const d = ensureDay(k);

    if (Array.isArray(rec.samples)) {
      for (const s of rec.samples) {
        if (s.beatsPerMinute !== undefined) {
          d.hr_samples.push(s.beatsPerMinute);
        }
      }
    }
  }

  //-----------------------------------------------------
  // SLEEP SESSIONS
  //-----------------------------------------------------
  const sleepDocs = await SleepSession.find({
    user: userId,
    startTime: { $gte: start, $lte: end },
  });

  for (const s of sleepDocs) {
    const k = dayKey(s.startTime);
    const d = ensureDay(k);

    let minutes = 0;

    if (Array.isArray(s.stages) && s.stages.length > 0) {
      for (const st of s.stages) {
        if (st.startTime && st.endTime) {
          const t1 = new Date(st.startTime);
          const t2 = new Date(st.endTime);
          minutes += (t2 - t1) / (1000 * 60);
        }
      }
    } else if (s.startTime && s.endTime) {
      minutes +=
        (new Date(s.endTime) - new Date(s.startTime)) / (1000 * 60);
    }

    d.sleep_minutes += minutes;
  }

  //-----------------------------------------------------
  // STEPS
  //-----------------------------------------------------
  const stepDocs = await Step.find({
    user: userId,
    startTime: { $gte: start, $lte: end },
  });

  for (const st of stepDocs) {
    const k = dayKey(st.startTime);
    const d = ensureDay(k);
    d.steps_total += st.count || 0;
  }

  //-----------------------------------------------------
  // EXERCISE
  //-----------------------------------------------------
  const exDocs = await ExerciseSession.find({
    user: userId,
    startTime: { $gte: start, $lte: end },
  });

  for (const ex of exDocs) {
    const k = dayKey(ex.startTime);
    const d = ensureDay(k);
    if (ex.startTime && ex.endTime) {
      d.exercise_ms += new Date(ex.endTime) - new Date(ex.startTime);
    }
  }

  //-----------------------------------------------------
  // BLOOD PRESSURE
  //-----------------------------------------------------
  const bpDocs = await BloodPressure.find({
    user: userId,
    time: { $gte: start, $lte: end },
  });

  for (const bp of bpDocs) {
    const k = dayKey(bp.time);
    const d = ensureDay(k);

    if (bp.systolic?.inMillimetersOfMercury !== undefined) {
      d.bp_sys_values.push(bp.systolic.inMillimetersOfMercury);
    }
    if (bp.diastolic?.inMillimetersOfMercury !== undefined) {
      d.bp_dia_values.push(bp.diastolic.inMillimetersOfMercury);
    }
  }

  //-----------------------------------------------------
  // SpO2
  //-----------------------------------------------------
  const spo2Docs = await SpO2.find({
    user: userId,
    time: { $gte: start, $lte: end },
  });

  // 🔴 OPTION 1 LOGIC: if there is ZERO data in all collections,
  //     return null to signal "insufficient data"
  const hasAnyDocs =
    hrDocs.length ||
    sleepDocs.length ||
    stepDocs.length ||
    exDocs.length ||
    bpDocs.length ||
    spo2Docs.length;

  if (!hasAnyDocs) {
    // No physiological data at all for this user in the window
    return null;
  }

  // If we reach here, we have at least some data (even 1 day) — we continue.

  for (const o of spo2Docs) {
    const k = dayKey(o.time);
    const d = ensureDay(k);

    // assuming field name is "percentage" from your controller
    if (o.percentage !== undefined && o.percentage !== null) {
      d.spo2_values.push(o.percentage);
    }
  }

  //-----------------------------------------------------
  // FINAL: create array oldest → newest
  //-----------------------------------------------------
  const days = [];

  for (let i = seqLen - 1; i >= 0; i--) {
    const cur = new Date(end);
    cur.setDate(cur.getDate() - i);
    const key = dayKey(cur);
    const d = ensureDay(key);

    const hr_mean =
      d.hr_samples.length > 0
        ? d.hr_samples.reduce((a, b) => a + b, 0) / d.hr_samples.length
        : null;

    const hr_min =
      d.hr_samples.length > 0 ? Math.min(...d.hr_samples) : null;

    const hr_max =
      d.hr_samples.length > 0 ? Math.max(...d.hr_samples) : null;

    const sleep_hours = d.sleep_minutes / 60;

    const exercise_minutes = d.exercise_ms / (1000 * 60);

    const bp_sys_mean =
      d.bp_sys_values.length > 0
        ? d.bp_sys_values.reduce((a, b) => a + b, 0) /
          d.bp_sys_values.length
        : null;

    const bp_dia_mean =
      d.bp_dia_values.length > 0
        ? d.bp_dia_values.reduce((a, b) => a + b, 0) /
          d.bp_dia_values.length
        : null;

    const spo2_mean =
      d.spo2_values.length > 0
        ? d.spo2_values.reduce((a, b) => a + b, 0) / d.spo2_values.length
        : null;

    const spo2_min =
      d.spo2_values.length > 0 ? Math.min(...d.spo2_values) : null;

    const spo2_max =
      d.spo2_values.length > 0 ? Math.max(...d.spo2_values) : null;

    // Simple derived sleep_score from sleep_hours (you can replace later)
    let sleep_score = null;
    if (sleep_hours && sleep_hours > 0) {
      const normalized = Math.min(sleep_hours / 8, 1); // 0..1
      sleep_score = Math.round(normalized * 100);      // 0..100
    }

    // stress_score is currently missing in live DB; mark as null
    const stress_score = null;

    days.push({
      hr_mean,
      hr_min,
      hr_max,

      spo2_mean,
      spo2_min,
      spo2_max,

      sleep_hours,
      sleep_score,

      steps_total: d.steps_total,
      exercise_minutes,

      bp_sys_mean,
      bp_dia_mean,

      stress_score,
    });
  }

  return days;
}

//-----------------------------------------------------
// CALL FASTAPI PREDICT()
//-----------------------------------------------------
export async function getInsomniaRisk(userId) {
  const days = await buildDailyFeatures(userId, SEQ_LEN);

  // 🔴 If buildDailyFeatures found zero data → return "insufficient data"
  if (!days) {
    return {
      person_id: String(userId),
      insomnia_risk: null,
      message:
        "Insufficient data to compute insomnia risk. No physiological data found for this user.",
      insufficientData: true,
    };
  }

  const payload = {
    person_id: String(userId),
    days,
  };

  const res = await axios.post(`${AI_SERVICE_URL}/predict`, payload);
  return res.data; // { insomnia_risk, person_id, message, ... }
}

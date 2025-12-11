// src/components/AI.jsx

import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const AI = () => {
  const { backendUrl } = useContext(AppContext);

  const [risk, setRisk] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | ok | no-data | error
  const [message, setMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const logDebug = (label, data) => {
    console.log(`[AI.jsx] ${label}`, data);
  };

  // helper: convert 0–1 risk to percentage with normal rounding
  const getRiskPercent = (value) => {
    if (typeof value !== "number") return null;
    return Math.round(value * 100); // 0.554 -> 55, 0.555 -> 56
  };

  // POST → call AI, save to DB, return fresh score
  const runPrediction = async () => {
    if (!backendUrl) return;

    try {
      setStatus("loading");
      setMessage("Computing your insomnia risk score…");
      setRisk(null);

      const url = `${backendUrl}/api/ai/insomnia-risk`;
      logDebug("Sending POST /api/ai/insomnia-risk", { url });

      const res = await axios.post(
        url,
        {}, // no body; user comes from cookie + userAuth on the server
        {
          withCredentials: true,
          timeout: 20000,
        }
      );

      logDebug("Response from POST /insomnia-risk", res.data);

      const { success, data, message: apiMessage } = res.data || {};

      if (success && data && typeof data.risk === "number") {
        setRisk(data.risk); // keep the raw 0.xxx value
        setStatus("ok");
        setMessage(apiMessage || "Insomnia risk computed successfully.");
        setLastUpdated(
          data.createdAt ? new Date(data.createdAt) : new Date()
        );
      } else {
        setRisk(null);
        setStatus("no-data");
        setMessage(
          apiMessage ||
            "Insufficient data to compute insomnia risk. Keep wearing your device consistently."
        );
        setLastUpdated(null);
      }
    } catch (err) {
      console.error("[AI.jsx] ERROR calling insomnia-risk:", err);

      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message;

      setRisk(null);
      setStatus("error");
      setMessage(
        serverMsg || "Something went wrong while contacting the AI service."
      );
      setLastUpdated(null);
    }
  };

  const isLoading = status === "loading";
  const riskPercent = risk != null ? getRiskPercent(risk) : null;

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl mx-auto bg-gray-900/95 rounded-2xl 
                   border border-gray-800/60 backdrop-blur-xl shadow-lg
                   px-4 sm:px-8 lg:px-10 py-6 sm:py-8"
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
          {/* Header */}
          <div className="w-full mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-xl sm:text-2xl font-semibold text-white">
                Insomnia Risk (AI)
              </h2>
              {status === "error" && (
                <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Run the model to estimate your current insomnia risk based on
              your recent wearable data. You can generate a new prediction
              any time you have fresh data.
            </p>
          </div>

          {/* Score / state */}
          <div className="w-full min-h-[120px] flex flex-col items-center justify-center space-y-3 mb-6">
            {isLoading && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-300">
                  {message || "Analyzing your data…"}
                </p>
              </div>
            )}

            {status === "ok" && risk !== null && !isLoading && (
              <>
                <div className="flex flex-col items-center">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
                    Current Risk
                  </p>

                  {/* Big % display + raw score below */}
                  <div className="inline-flex flex-col items-center gap-1">
                    {riskPercent !== null && (
                      <span className="text-4xl sm:text-5xl font-semibold text-white">
                        {riskPercent}%
                      </span>
                    )}
                    <span className="text-xs sm:text-sm text-gray-400">
                      Raw score:{" "}
                      <span className="font-mono text-gray-200">
                        {risk.toFixed(3)}
                      </span>{" "}
                      (0.000 – 1.000)
                    </span>
                  </div>

                  <p className="text-[11px] sm:text-xs text-gray-500 mt-2">
                    0.000 = very low risk · 1.000 = very high risk
                  </p>
                </div>

                {message && (
                  <p className="text-xs sm:text-sm text-gray-300 max-w-md">
                    {message}
                  </p>
                )}
              </>
            )}

            {status === "no-data" && !isLoading && (
              <div className="flex flex-col items-center gap-2 max-w-md">
                <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400" />
                <p className="text-sm text-yellow-200 font-medium">
                  Not enough data yet
                </p>
                <p className="text-xs sm:text-sm text-gray-300">{message}</p>
              </div>
            )}

            {(status === "idle" || (status === "error" && !risk)) &&
              !isLoading && (
                <p className="text-xs sm:text-sm text-gray-400 max-w-md">
                  When you are ready, run the AI model to compute your current
                  insomnia risk score.
                </p>
              )}

            {status === "error" && !isLoading && (
              <p className="text-xs sm:text-sm text-red-300 max-w-md">
                {message}
              </p>
            )}
          </div>

          {/* Meta */}
          {lastUpdated && (
            <div className="mb-4 text-[11px] sm:text-xs text-gray-500">
              Last computed{" "}
              {lastUpdated.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
          )}

          {/* Button */}
          <div className="w-full max-w-md mx-auto">
            <button
              type="button"
              onClick={runPrediction}
              disabled={isLoading}
              className={`w-full inline-flex items-center justify-center px-4 py-2.5 
                          rounded-lg text-sm font-medium transition
                          ${
                            isLoading
                              ? "bg-blue-700/40 text-blue-200 cursor-not-allowed"
                              : "bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-300 text-white shadow-lg shadow-blue-500/30"
                          }`}
            >
              {isLoading ? "Running prediction…" : "Run AI Prediction"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AI;

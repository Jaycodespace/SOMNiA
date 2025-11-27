const axios = require("axios");

// In production, this will be your FastAPI URL
const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

async function predictInsomnia(personId, daysSequence) {
  try {
    const res = await axios.post(`${FASTAPI_URL}/predict`, {
      person_id: personId,
      days: daysSequence,
    });

    return res.data; // { person_id, insomnia_risk, message }
  } catch (err) {
    console.error("Error calling FastAPI /predict:", err.message);
    throw new Error("AI service unavailable");
  }
}

module.exports = {
  predictInsomnia,
};

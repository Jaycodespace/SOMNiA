import Step from "../models/stepsModel.js";

export const addStepData = async (req, res) => {
  const steps = req.body; // expecting an array of step objects

  if (!Array.isArray(steps) || steps.length === 0) {
    return res.status(400).json({ success: false, message: 'Request body must be a non-empty array' });
  }
 
  try {
    for (const step of steps) {
      const { id, lastModifiedTime, count, startTime, endTime, userId } = step;

      if (!id || !lastModifiedTime || !count || !startTime || !endTime || !userId) {
        return res.status(400).json({ success: false, message: 'Missing required details in one or more steps' });
      }

      await Step.findOneAndUpdate(
        { id },
        {
          user: userId,
          id,
          lastModifiedTime: new Date(lastModifiedTime),
          count,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    return res.status(200).json({ success: true, message: "Step data synced successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

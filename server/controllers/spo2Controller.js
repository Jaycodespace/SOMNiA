import SpO2 from '../models/spo2Model.js';

// =============================
// Add SpO2 data
// =============================
export const addSpO2Data = async (req, res) => {
  const payload = Array.isArray(req.body) ? req.body : [req.body];

  try {
    const results = [];

    for (const record of payload) {
      const {
        percentage,
        time,
        id,
        clientRecordId,
        clientRecordVersion,
        dataOrigin,
        lastModifiedTime,
        userId
      } = record;

      // Required fields check
      if (
        percentage === undefined ||
        !time ||
        !id ||
        !lastModifiedTime
      ) {
        return res.status(400).json({
          success: false,
          message: 'Missing required SpO2 details'
        });
      }

      // Duplicate prevention
      const existing = await SpO2.findOne({ id });
      if (existing) {
        continue; // skip duplicate
      }

      const spo2Data = new SpO2({
        user: userId,
        percentage,
        time: new Date(time),
        id,
        clientRecordId,
        clientRecordVersion,
        dataOrigin,
        recordingMethod: null,
        device: null,
        lastModifiedTime: new Date(lastModifiedTime)
      });

      await spo2Data.save();
      results.push(spo2Data);
    }

    return res.status(201).json({
      success: true,
      inserted: results.length,
      message: 'SpO2 data added successfully'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =============================
// Get latest SpO2 data
// =============================
export const getLatestSpO2 = async (req, res) => {
  const userId = req.params.userId;

  try {
    const latestSpO2 = await SpO2.findOne({ user: userId }).sort({ time: -1 });

    if (!latestSpO2) {
      return res.status(404).json({
        success: false,
        message: 'No SpO2 data found'
      });
    }

    return res.status(200).json({
      success: true,
      data: latestSpO2
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =============================
// Update SpO2 data
// =============================
export const updateSpO2Data = async (req, res) => {
  const id = req.params.id;
  const updateData = req.body;

  try {
    const updated = await SpO2.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'SpO2 record not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: updated
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =============================
// Delete SpO2 data
// =============================
export const deleteSpO2Data = async (req, res) => {
  const { id } = req.params;
  const userId = req.body.userId;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'SpO2 ID is required'
    });
  }

  try {
    const spo2Data = await SpO2.findOne({ _id: id, user: userId });

    if (!spo2Data) {
      return res.status(404).json({
        success: false,
        message: 'SpO2 data not found or unauthorized'
      });
    }

    await SpO2.deleteOne({ _id: id, user: userId });

    return res.status(200).json({
      success: true,
      message: 'SpO2 data deleted successfully'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

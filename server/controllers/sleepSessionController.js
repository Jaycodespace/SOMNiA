import SleepSession from '../models/sleepSessionModel.js';

export const addSleepSession = async (req, res) => {
  const sleepSessions = req.body; // expecting an array of sleep session objects

  if (!Array.isArray(sleepSessions) || sleepSessions.length === 0) {
    return res.status(400).json({ success: false, message: 'Request body must be a non-empty array' });
  }
 
  try {
    for (const session of sleepSessions) {
      const { stages, lastModifiedTime, id, title, startTime, endTime, userId } = session;

      if (
        !Array.isArray(stages) ||
        !lastModifiedTime ||
        !id ||
        !startTime ||
        !endTime ||
        !userId
      ) {
        return res.status(400).json({ success: false, message: 'Missing required details in one or more sessions' });
      }

      await SleepSession.findOneAndUpdate(
        { id },
        {
          user: userId,
          stages,
          lastModifiedTime: new Date(lastModifiedTime),
          id,
          title: title || null,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    return res.status(200).json({ success: true, message: 'Sleep Session data synced successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// NEW FUNCTION: Get only the latest sleep session
export const getLatestSleepSession = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    console.log('Fetching latest sleep session for user:', userId);

    // Get the most recent sleep session (sorted by startTime descending, limit 1)
    const latestSession = await SleepSession.findOne({
      user: userId
    }).sort({ startTime: -1 });

    if (!latestSession) {
      console.log('No sleep session found for user');
      return res.status(200).json({
        success: true,
        data: {
          latestSessionMinutes: 0,
          latestSessionHours: 0,
          sessionStartTime: null,
          sessionEndTime: null,
          message: 'No sleep session found'
        }
      });
    }

    console.log('Latest session found:', {
      id: latestSession.id,
      startTime: latestSession.startTime,
      endTime: latestSession.endTime,
      stagesCount: latestSession.stages?.length || 0
    });

    // Calculate duration for the latest session only
    let sessionDurationMinutes = 0;

    if (latestSession.stages && latestSession.stages.length > 0) {
      // Calculate sleep time from stages
      latestSession.stages.forEach(stage => {
        if (stage.startTime && stage.endTime) {
          const stageStartTime = new Date(stage.startTime);
          const stageEndTime = new Date(stage.endTime);
          const stageDurationMs = stageEndTime - stageStartTime;
          const stageDurationMinutes = stageDurationMs / (1000 * 60);
          
          sessionDurationMinutes += stageDurationMinutes;
        }
      });
    } else {
      // Fallback: use session start/end time if no stages
      const sessionStartTime = new Date(latestSession.startTime);
      const sessionEndTime = new Date(latestSession.endTime);
      const sessionDurationMs = sessionEndTime - sessionStartTime;
      sessionDurationMinutes = sessionDurationMs / (1000 * 60);
    }

    const sessionDurationHours = Math.round((sessionDurationMinutes / 60) * 100) / 100;

    console.log(`Latest session duration: ${Math.round(sessionDurationMinutes)} minutes (${sessionDurationHours} hours)`);

    return res.status(200).json({
      success: true,
      data: {
        latestSessionMinutes: Math.round(sessionDurationMinutes),
        latestSessionHours: sessionDurationHours,
        sessionStartTime: latestSession.startTime,
        sessionEndTime: latestSession.endTime,
        sessionId: latestSession.id,
        sessionTitle: latestSession.title,
        lastModified: latestSession.lastModifiedTime
      }
    });

  } catch (error) {
    console.error('Error in getLatestSleepSession:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message,
      error: error.toString()
    });
  }
};

export const getSleepSessions = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    console.log('Fetching sleep session data for user:', userId);

    // Get all sleep session data for the user
    const sleepSessions = await SleepSession.find({
      user: userId
    }).sort({ startTime: -1 });

    console.log(`Found ${sleepSessions.length} sleep session records`);

    if (!sleepSessions.length) {
      console.log('No sleep session data found for user');
      return res.status(200).json({
        success: true,
        data: {
          totalSleepMinutes: 0,
          totalSleepHours: 0,
          sessionCount: 0,
          message: 'No sleep session data found'
        }
      });
    }

    // Calculate total sleep time from all sessions
    let totalSleepMinutes = 0;
    let validSessionCount = 0;

    sleepSessions.forEach(session => {
      if (session.stages && session.stages.length > 0) {
        // Calculate sleep time from stages
        session.stages.forEach(stage => {
          if (stage.startTime && stage.endTime) {
            const stageStartTime = new Date(stage.startTime);
            const stageEndTime = new Date(stage.endTime);
            const stageDurationMs = stageEndTime - stageStartTime;
            const stageDurationMinutes = stageDurationMs / (1000 * 60);
            
            totalSleepMinutes += stageDurationMinutes;
          }
        });
        validSessionCount++;
      } else {
        // Fallback: use session start/end time if no stages
        const sessionStartTime = new Date(session.startTime);
        const sessionEndTime = new Date(session.endTime);
        const sessionDurationMs = sessionEndTime - sessionStartTime;
        const sessionDurationMinutes = sessionDurationMs / (1000 * 60);
        
        totalSleepMinutes += sessionDurationMinutes;
        validSessionCount++;
      }
    });

    console.log(`Total sleep time calculated: ${Math.round(totalSleepMinutes)} minutes across ${validSessionCount} sessions`);

    const totalSleepHours = Math.round((totalSleepMinutes / 60) * 100) / 100; // Round to 2 decimal places

    return res.status(200).json({
      success: true,
      data: {
        totalSleepMinutes: Math.round(totalSleepMinutes),
        totalSleepHours,
        sessionCount: validSessionCount,
        recordCount: sleepSessions.length
      }
    });

  } catch (error) {
    console.error('Error in getSleepSessions:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message,
      error: error.toString()
    });
  }
};

export const getDetailedSleepStats = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    const sleepSessions = await SleepSession.find({
      user: userId
    }).sort({ startTime: -1 });

    return res.status(200).json({
      success: true,
      data: {
        sessions: sleepSessions
      }
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getSleepHistory = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    console.log('Fetching sleep history data for user:', userId);

    // Get sleep sessions from the last 60 days for comprehensive history
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const sleepSessions = await SleepSession.find({
      user: userId,
      startTime: { $gte: sixtyDaysAgo }
    }).sort({ startTime: -1 });

    console.log(`Found ${sleepSessions.length} sleep sessions in last 60 days`);

    if (!sleepSessions.length) {
      console.log('No sleep history data found for user');
      return res.status(200).json({
        success: true,
        data: {
          sessions: [],
          summary: {
            totalSessions: 0,
            averageDuration: 0,
            totalSleepHours: 0
          }
        }
      });
    }

    // Calculate summary statistics
    let totalSleepMinutes = 0;
    let validSessionCount = 0;

    const processedSessions = sleepSessions.map(session => {
      let sessionDurationMinutes = 0;

      if (session.stages && session.stages.length > 0) {
        // Calculate from stages
        session.stages.forEach(stage => {
          if (stage.startTime && stage.endTime) {
            const stageStartTime = new Date(stage.startTime);
            const stageEndTime = new Date(stage.endTime);
            const stageDurationMs = stageEndTime - stageStartTime;
            const stageDurationMinutes = stageDurationMs / (1000 * 60);
            sessionDurationMinutes += stageDurationMinutes;
          }
        });
      } else {
        // Fallback: use session start/end time
        const sessionStartTime = new Date(session.startTime);
        const sessionEndTime = new Date(session.endTime);
        const sessionDurationMs = sessionEndTime - sessionStartTime;
        sessionDurationMinutes = sessionDurationMs / (1000 * 60);
      }

      totalSleepMinutes += sessionDurationMinutes;
      validSessionCount++;

      return {
        id: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        stages: session.stages || [],
        title: session.title,
        lastModifiedTime: session.lastModifiedTime,
        durationMinutes: Math.round(sessionDurationMinutes),
        durationHours: Math.round((sessionDurationMinutes / 60) * 100) / 100
      };
    });

    const averageDurationMinutes = validSessionCount > 0 ? totalSleepMinutes / validSessionCount : 0;
    const totalSleepHours = Math.round((totalSleepMinutes / 60) * 100) / 100;

    console.log(`Processed ${validSessionCount} sessions, total sleep: ${totalSleepHours} hours`);

    return res.status(200).json({
      success: true,
      data: {
        sessions: processedSessions,
        summary: {
          totalSessions: validSessionCount,
          averageDuration: Math.round(averageDurationMinutes),
          averageDurationHours: Math.round((averageDurationMinutes / 60) * 100) / 100,
          totalSleepHours: totalSleepHours,
          totalSleepMinutes: Math.round(totalSleepMinutes),
          dateRange: {
            from: sixtyDaysAgo.toISOString(),
            to: new Date().toISOString()
          }
        }
      }
    });

  } catch (error) {
    console.error('Error in getSleepHistory:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message,
      error: error.toString()
    });
  }
};

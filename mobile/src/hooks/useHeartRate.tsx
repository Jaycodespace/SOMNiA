import { useCallback } from 'react';
import { requestPermission, readRecords, getGrantedPermissions } from 'react-native-health-connect';
import { TimeRangeFilter } from 'react-native-health-connect/lib/typescript/types/base.types';

export const useHeartRate = (date: Date) => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const timeRangeFilter: TimeRangeFilter = {
    operator: 'between',
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString(),
  };

  const requestHeartRate = useCallback(async () => {
    // First check if permission is already granted
    try {
      const granted = await getGrantedPermissions();
      const hasPermission = granted.some(
        (p) => p.recordType === 'HeartRate'
      );

      if (hasPermission) {
        return true; // Permission already granted, no need to request
      }
    } catch (err) {
      // If check fails, try requesting permission
    }

    // Only request if not already granted
    try {
      const granted = await requestPermission([
        { accessType: 'read', recordType: 'HeartRate' },
      ]);

      const hasPermission = granted.some(
        (p) => p.recordType === 'HeartRate'
      );

      return hasPermission;
    } catch (err) {
      // Permission denied or error - return false silently
      return false;
    }
  }, []);

  const readHeartRate = useCallback(async () => {
    const hasPermission = await requestHeartRate();
    
    if (!hasPermission) {
      // Return empty array if no permission instead of throwing error
      return [];
    }

    try {
      const { records } = await readRecords('HeartRate', { timeRangeFilter });
      return records;
    } catch (err) {
      // Return empty array on error instead of throwing
      return [];
    }
  }, [requestHeartRate, timeRangeFilter]);

  return {
    readHeartRate,
  };
};

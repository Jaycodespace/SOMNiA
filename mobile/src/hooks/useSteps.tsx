import { useCallback } from 'react';
import { requestPermission, readRecords, getGrantedPermissions } from 'react-native-health-connect';
import { TimeRangeFilter } from 'react-native-health-connect/lib/typescript/types/base.types';

export const useSteps = (date: Date) => {
  const startDate = new Date(date); // Clone for start
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(date); // Clone for end
  endDate.setHours(23, 59, 59, 999);

  const timeRangeFilter: TimeRangeFilter = {
    operator: 'between',
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString(),
  };

  const requestSteps = useCallback(async () => {
    // First check if permission is already granted
    try {
      const granted = await getGrantedPermissions();
      if (granted.some((p) => p.recordType === 'Steps')) {
        return true; // Permission already granted, no need to request
      }
    } catch (err) {
      // If check fails, try requesting permission
    }

    // Only request if not already granted
    try {
      const granted = await requestPermission([
        { accessType: 'read', recordType: 'Steps' },
      ]);

      return granted.some((p) => p.recordType === 'Steps');
    } catch (err) {
      // Permission denied or error - return false silently
      return false;
    }
  }, []);

  const readSteps = useCallback(async () => {
    const hasPermission = await requestSteps();
    
    if (!hasPermission) {
      // Return empty array if no permission instead of throwing error
      return [];
    }

    try {
      const { records } = await readRecords('Steps', {
        timeRangeFilter,
      });
      return records;
    } catch (err) {
      // Return empty array on error instead of throwing
      return [];
    }
  }, [requestSteps, timeRangeFilter]);

  return {
    readSteps,
  };
};

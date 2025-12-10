import { useCallback } from 'react';
import { requestPermission, readRecords } from 'react-native-health-connect';
import { TimeRangeFilter } from 'react-native-health-connect/lib/typescript/types/base.types';

export const useOxygenSaturation = (date: Date) => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const timeRangeFilter: TimeRangeFilter = {
    operator: 'between',
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString(),
  };

  // --- REQUEST PERMISSION ---
  const requestOxygen = useCallback(async () => {
    const granted = await requestPermission([
      { accessType: 'read', recordType: 'OxygenSaturation' },
    ]);

    const hasPermission = granted.some(
      (p) => p.recordType === 'OxygenSaturation'
    );

    if (!hasPermission) {
      throw new Error('Permission not granted for OxygenSaturation');
    }
  }, []);

  // --- READ RECORDS ---
  const readOxygenSaturation = useCallback(async () => {
    await requestOxygen();

    const { records } = await readRecords('OxygenSaturation', {
      timeRangeFilter,
    });

    // console.log('Oxygen Saturation records:', records);
    return records;
  }, [requestOxygen, timeRangeFilter]);

  return {
    readOxygenSaturation,
  };
};

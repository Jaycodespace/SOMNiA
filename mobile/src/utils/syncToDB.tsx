import { RecordResult } from "react-native-health-connect";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/useAuthStore';

const backendUrl = 'https://somnia-api-iuvq.onrender.com';

const handleResponse = async (response: Response, dataType: string) => {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to sync ${dataType} data: ${errorData.message || response.statusText}`);
    }
    return response.json();
};

const getAuthToken = async () => {
    try {
        const { token, userId } = useAuthStore.getState();

        if (!token || !userId) {
            throw new Error("User not authenticated.");
        }
        return token;
    } catch (error) {
        console.error('Error getting auth token:', error);
        throw error;
    }
};

export const syncToDB = async (
    heartRate: RecordResult<"HeartRate">[],
    sleepSession: RecordResult<"SleepSession">[],
    steps: RecordResult<"Steps">[],
    spo2: RecordResult<"OxygenSaturation">[]
) => {
    try {
        const token = await getAuthToken();
        const { userId } = useAuthStore.getState();

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };

        // Heart Rate
        const heartRatePayload = heartRate
            .filter(record => record?.metadata?.id)
            .map(record => ({
                userId,
                id: record.metadata.id,
                lastModifiedTime: record.metadata.lastModifiedTime,
                startTime: record.startTime,
                endTime: record.endTime,
                samples: (record.samples || []).map(s => ({
                    beatsPerMinute: s.beatsPerMinute,
                    time: s.time,
                })),
            }));

        if (heartRatePayload.length > 0) {
            const heartRateResponse = await fetch(`${backendUrl}/api/heartRate/addHeartRate`, {
                method: "POST",
                headers,
                body: JSON.stringify(heartRatePayload),
            });
            await handleResponse(heartRateResponse, "heart rate");
        }

        // Sleep Session
        const sleepPayload = sleepSession
            .filter(record => record?.metadata?.id)
            .map(record => ({
                userId,
                id: record.metadata.id,
                lastModifiedTime: record.metadata.lastModifiedTime,
                startTime: record.startTime,
                endTime: record.endTime,
                title: record.title || null,
                stages: (record.stages || []).map(stage => ({
                    startTime: stage.startTime,
                    endTime: stage.endTime,
                    stage: stage.stage,
                })),
            }));

        if (sleepPayload.length > 0) {
            const sleepResponse = await fetch(`${backendUrl}/api/sleepSession/addSleepSession`, {
                method: "POST",
                headers,
                body: JSON.stringify(sleepPayload),
            });
            await handleResponse(sleepResponse, "sleep session");
        }

        // Steps
        const stepsPayload = steps
            .filter(record => record?.metadata?.id)
            .map(record => ({
                userId,
                id: record.metadata.id,
                lastModifiedTime: record.metadata.lastModifiedTime,
                startTime: record.startTime,
                endTime: record.endTime,
                count: record.count,
            }));

        if (stepsPayload.length > 0) {
            const stepsResponse = await fetch(`${backendUrl}/api/step/addStep`, {
                method: "POST",
                headers,
                body: JSON.stringify(stepsPayload),
            });
            await handleResponse(stepsResponse, "steps");
        }

        // SPO2
        const spo2Payload = spo2
            .filter(record => record?.metadata?.id)
            .map(record => ({
                userId,
                id: record.metadata.id,
                percentage: record.percentage,
                time: record.time,
                clientRecordId: record.metadata.clientRecordId ?? null,
                clientRecordVersion: record.metadata.clientRecordVersion ?? null,
                dataOrigin: record.metadata.dataOrigin ?? null,
                lastModifiedTime: record.metadata.lastModifiedTime
            }));

        if (spo2Payload.length > 0) {
            await handleResponse(
                await fetch(`${backendUrl}/api/spo2/addSpO2`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(spo2Payload),
                }),
                "SpO2"
            );
        }

        console.log("Health data synced successfully.");
    } catch (error) {
        console.error("Error syncing data:", error);
        throw error;
    }
};

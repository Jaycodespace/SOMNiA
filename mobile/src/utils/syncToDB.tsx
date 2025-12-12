import { RecordResult } from "react-native-health-connect";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/useAuthStore';

const backendUrl = 'http://172.20.10.2:4000';

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
        if (!token) {
            throw new Error('No authentication token found');
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
        
        // ✅ FIX — get userId here
        const { userId } = useAuthStore.getState();

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };

        // Heart Rate
        const heartRatePayload = heartRate.map((record) => ({
            userId, // <-- FIXED
            id: record.metadata.id,
            lastModifiedTime: record.metadata.lastModifiedTime,
            startTime: record.startTime,
            endTime: record.endTime,
            samples: record.samples.map((s) => ({
                beatsPerMinute: s.beatsPerMinute,
                time: s.time,
            })),
        }));

        const heartRateResponse = await fetch(`${backendUrl}/api/heartRate/addHeartRate`, {
            method: "POST",
            headers,
            body: JSON.stringify(heartRatePayload),
        });
        await handleResponse(heartRateResponse, "heart rate");

        // Sleep Session
        const sleepPayload = sleepSession.map((record) => ({
            userId, // <-- FIXED
            id: record.metadata.id,
            lastModifiedTime: record.metadata.lastModifiedTime,
            startTime: record.startTime,
            endTime: record.endTime,
            title: record.title || null,
            stages: (record.stages || []).map((stage) => ({
                startTime: stage.startTime,
                endTime: stage.endTime,
                stage: stage.stage,
            })),
        }));

        const sleepResponse = await fetch(`${backendUrl}/api/sleepSession/addSleepSession`, {
            method: "POST",
            headers,
            body: JSON.stringify(sleepPayload),
        });
        await handleResponse(sleepResponse, "sleep session");

        // Steps
        const stepsPayload = steps.map((record) => ({
            userId, // <-- FIXED
            id: record.metadata.id,
            lastModifiedTime: record.metadata.lastModifiedTime,
            startTime: record.startTime,
            endTime: record.endTime,
            count: record.count,
        }));

        const stepsResponse = await fetch(`${backendUrl}/api/step/addStep`, {
            method: "POST",
            headers,
            body: JSON.stringify(stepsPayload),
        });
        await handleResponse(stepsResponse, "steps");

        // ==========================
        // SPO2 (Oxygen Saturation)
        // ==========================
        const spo2Payload = spo2.map((record) => ({
            userId,
            id: record.metadata.id,
            percentage: record.percentage,
            time: record.time,

            // Optional metadata ONLY (HC does not provide device/recordingMethod)
            clientRecordId: record.metadata.clientRecordId ?? null,
            clientRecordVersion: record.metadata.clientRecordVersion ?? null,
            dataOrigin: record.metadata.dataOrigin ?? null,

            lastModifiedTime: record.metadata.lastModifiedTime
        }));


        await handleResponse(
            await fetch(`${backendUrl}/api/spo2/addSpO2`, {
                method: "POST",
                headers,
                body: JSON.stringify(spo2Payload),
            }),
            "SpO2"
        );

        console.log("Health data synced successfully.");
    } catch (error) {
        console.error("Error syncing data:", error);
        throw error;
    }
};


import { useEffect, useState } from "react";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function useCheckUsername(username: string) {
  const [status, setStatus] = useState<"checking" | "available" | "taken" | "short" | null>(null);

  useEffect(() => {
    if (!username.trim()) return setStatus(null);
    if (username.trim().length < 3) return setStatus("short");

    const timeout = setTimeout(async () => {
      setStatus("checking");
      try {
        const res = await fetch(`${API_URL}/api/auth/check-username`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
        const data = await res.json();
        setStatus(data.available ? "available" : "taken");
      } catch {
        setStatus(null);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [username]);

  return status;
}

import { useEffect, useState } from "react";
import validator from "validator";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function useCheckEmail(email: string) {
  const [status, setStatus] = useState<"checking" | "available" | "taken" | "invalid" | null>(null);

  useEffect(() => {
    if (!email.trim()) return setStatus(null);

    const timeout = setTimeout(async () => {
      if (!validator.isEmail(email)) return setStatus("invalid");

      setStatus("checking");
      try {
        const res = await fetch(`${API_URL}/api/auth/check-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        setStatus(data.available ? "available" : "taken");
      } catch {
        setStatus(null);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [email]);

  return status;
}

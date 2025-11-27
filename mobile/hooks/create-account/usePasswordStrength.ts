import { useEffect, useState } from "react";
import zxcvbn from "zxcvbn";

export default function usePasswordStrength(password: string) {
  const [strength, setStrength] = useState<{ score: number; feedback: string } | null>(null);

  useEffect(() => {
    if (!password) return setStrength(null);
    const { score } = zxcvbn(password);
    const feedback =
      score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : "Strong";
    setStrength({ score, feedback });
  }, [password]);

  return strength;
}

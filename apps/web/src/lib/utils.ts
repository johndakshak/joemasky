export { cn } from "cn";

// Password strength scoring — 4 criteria: length ≥8, uppercase, digit, symbol.
export type StrengthLevel = { label: string; color: string; pct: string } | null;

export function getPasswordStrength(val: string): StrengthLevel {
  if (!val) return null;
  let score = 0;
  if (val.length >= 8)          score++;
  if (/[A-Z]/.test(val))        score++;
  if (/[0-9]/.test(val))        score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const levels: StrengthLevel[] = [
    { label: "Weak",   color: "#b05c3a", pct: "25%"  },
    { label: "Weak",   color: "#b05c3a", pct: "25%"  },
    { label: "Fair",   color: "#c8a030", pct: "50%"  },
    { label: "Good",   color: "#8aab6f", pct: "75%"  },
    { label: "Strong", color: "#4e9e6b", pct: "100%" },
  ];
  return levels[score] ?? levels[0];
}

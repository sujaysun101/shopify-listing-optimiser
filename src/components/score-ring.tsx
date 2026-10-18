export function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" role="img" aria-label={`Score ${score} out of 100`}>
      <circle cx="36" cy="36" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="6" />
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 36 36)"
      />
      <text x="36" y="40" textAnchor="middle" fontSize="16" fontWeight="650" fill="currentColor">
        {score}
      </text>
    </svg>
  );
}

interface CircularScoreProps {
  score: number;
  riskLevel: "low" | "medium" | "high";
  size?: number;
}

const getRiskColor = (riskLevel: string) => {
  if (riskLevel === "low") return "#10b981";
  if (riskLevel === "medium") return "#f59e0b";
  return "#ef4444";
};

const CircularScore = ({ score, riskLevel, size = 24 }: CircularScoreProps) => {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = getRiskColor(riskLevel);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2C2D32"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
        style={{ color }}
      >
        {score}
      </div>
    </div>
  );
};

export default CircularScore;

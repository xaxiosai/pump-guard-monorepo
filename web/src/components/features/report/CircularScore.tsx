interface CircularScoreProps {
  score: number;
  image?: string | null;
  symbol?: string;
  size?: number;
  strokeWidth?: number;
}

const CircularScore = ({ score, image, symbol, size = 32, strokeWidth = 3 }: CircularScoreProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const imageSize = size - strokeWidth * 2 - 4;

  const getColor = () => {
    if (score >= 70) return "#10B981";
    if (score >= 40) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="absolute transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-border-primary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {image ? (
        <img
          src={image}
          alt={symbol}
          className="rounded-full"
          style={{ width: imageSize, height: imageSize }}
        />
      ) : symbol ? (
        <div
          className="rounded-full bg-primary/10 flex items-center justify-center"
          style={{ width: imageSize, height: imageSize }}
        >
          <span className="text-primary font-bold" style={{ fontSize: imageSize / 2.5 }}>
            {symbol.charAt(0)}
          </span>
        </div>
      ) : null}
    </div>
  );
};

export default CircularScore;

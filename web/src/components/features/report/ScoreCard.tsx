import type { TokenScanResult } from "~/types/api";

interface ScoreCardProps {
  overallScore: number;
  riskLevel: TokenScanResult["riskLevel"];
}

const getRiskColor = (riskLevel: string) => {
  if (riskLevel === "low") return "text-emerald-500";
  if (riskLevel === "medium") return "text-amber-500";
  return "text-rose-500";
};

const ScoreCard = ({ overallScore, riskLevel }: ScoreCardProps) => {
  return (
    <div className="px-content py-8 border-b border-border-primary">
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-foreground/50 text-xs uppercase tracking-wider">
          Overall Risk Score
        </h2>
        <div className={`${getRiskColor(riskLevel)} text-4xl font-bold`}>
          {overallScore}%
        </div>
        <div className={`${getRiskColor(riskLevel)} text-base font-bold uppercase`}>
          {riskLevel} Risk
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;

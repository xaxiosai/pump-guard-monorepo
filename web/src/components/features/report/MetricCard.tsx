import type { MetricResult } from "~/types/api";
import Tooltip from "~/components/ui/Tooltip";

interface MetricCardProps {
  title: string;
  metric: MetricResult;
  displayValue: string;
  description?: string;
}

const getRiskLevelFromScore = (value: number, thresholds: MetricResult["thresholds"], type: MetricResult["type"]) => {
  if (type === "positive") {
    // For positive metrics: higher is better (low risk)
    if (value >= thresholds.low) return "low";
    if (value >= thresholds.medium) return "medium";
    return "high";
  } else {
    // For negative metrics: lower is better (low risk)
    if (value < thresholds.low) return "low";
    if (value < thresholds.medium) return "medium";
    return "high";
  }
};

const getRiskColor = (riskLevel: string) => {
  if (riskLevel === "low") return "text-emerald-500";
  if (riskLevel === "medium") return "text-amber-500";
  return "text-rose-500";
};

const getThresholdTooltip = (thresholds: MetricResult["thresholds"], type: MetricResult["type"]) => {
  if (type === "positive") {
    return (
      <div className="flex flex-col gap-1">
        <div className="text-emerald-500 font-semibold">Low Risk: ≥{thresholds.low}</div>
        <div className="text-amber-500 font-semibold">Medium Risk: {thresholds.medium}-{thresholds.low}</div>
        <div className="text-rose-500 font-semibold">High Risk: &lt;{thresholds.medium}</div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col gap-1">
        <div className="text-emerald-500 font-semibold">Low Risk: &lt;{thresholds.low}</div>
        <div className="text-amber-500 font-semibold">Medium Risk: {thresholds.low}-{thresholds.medium}</div>
        <div className="text-rose-500 font-semibold">High Risk: ≥{thresholds.medium}</div>
      </div>
    );
  }
};

const MetricCard = ({ title, metric, displayValue, description }: MetricCardProps) => {
  const riskLevel = getRiskLevelFromScore(metric.value, metric.thresholds, metric.type);
  const colorClass = getRiskColor(riskLevel);

  return (
    <Tooltip content={getThresholdTooltip(metric.thresholds, metric.type)}>
      <div className="border border-border-primary rounded-lg p-4 cursor-help hover:border-primary/50 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-foreground/60 text-xs uppercase tracking-wider mb-1">{title}</h3>
            {description && (
              <p className="text-foreground/40 text-xs">{description}</p>
            )}
          </div>
          <div className={`${colorClass} text-xl font-bold ml-3`}>
            {metric.score}%
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div className="text-xl font-bold text-foreground">{displayValue}</div>

          <div className="flex items-end gap-x-1.5">
            <span className={`${colorClass} font-bold text-sm uppercase tracking-wide`}>
              {riskLevel}
            </span>
            <span className={`${colorClass} text-xs`}>Risk</span>
          </div>
        </div>
      </div>
    </Tooltip>
  );
};

export default MetricCard;

import type { TokenScanResult } from "~/types/api";
import MetricCard from "./MetricCard";
import { formatNumber } from "~/utils/format";

interface MetricsGridProps {
  metrics: TokenScanResult["metrics"];
}

const MetricsGrid = ({ metrics }: MetricsGridProps) => {
  return (
    <div className="px-content py-6">
      <h2 className="text-foreground text-base font-semibold mb-4 uppercase tracking-wide">Risk Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Native Balance"
          metric={metrics.totalNativeBalance}
          displayValue={`${formatNumber(metrics.totalNativeBalance.value)} SOL`}
        />
        <MetricCard
          title="Fresh Wallets"
          metric={metrics.freshWalletsConcentration}
          displayValue={metrics.freshWalletsConcentration.value.toString()}
        />
        <MetricCard
          title="Zero SOL Holders"
          metric={metrics.zeroSolHolders}
          displayValue={metrics.zeroSolHolders.value.toString()}
        />
      </div>
    </div>
  );
};

export default MetricsGrid;

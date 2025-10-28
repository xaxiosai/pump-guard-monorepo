import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { scannerService } from "~/services/scanner.service";
import type { TokenScanResult } from "~/types/api";
import ReportHeader from "~/components/features/report/ReportHeader";
import ScoreCard from "~/components/features/report/ScoreCard";
import MetricsGrid from "~/components/features/report/MetricsGrid";

const Report = () => {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState<TokenScanResult | null>(null);

  useEffect(() => {
    const fetchTokenData = async () => {
      if (!tokenAddress) return;

      setLoading(true);
      try {
        const result = await scannerService.scanToken(tokenAddress);
        setTokenData(result);
      } catch (error) {
        console.error("Failed to fetch token data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();
  }, [tokenAddress]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-foreground/70 text-lg">Loading token data...</div>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-foreground/70 text-lg">Failed to load token data</div>
      </div>
    );
  }

  return (
    <div>
      <ReportHeader tokenData={tokenData} />
      <ScoreCard overallScore={tokenData.overallScore} riskLevel={tokenData.riskLevel} />
      <MetricsGrid metrics={tokenData.metrics} />
    </div>
  );
};

export default Report;

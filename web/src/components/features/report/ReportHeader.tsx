import { useState } from "react";
import type { TokenScanResult } from "~/types/api";
import { formatCurrency } from "~/utils/format";
import { FaCopy, FaCheck } from "react-icons/fa";

interface ReportHeaderProps {
  tokenData: TokenScanResult;
}

const ReportHeader = ({ tokenData }: ReportHeaderProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(tokenData.tokenAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-y-6 px-content pt-8 pb-6 border-b border-border-primary">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-xl font-bold">
              {tokenData.tokenInfo.symbol.charAt(0)}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-foreground text-2xl font-bold truncate">
              {tokenData.tokenInfo.name}
            </h1>
            <div className="flex items-center gap-x-2">
              <p className="text-foreground/50 text-sm">${tokenData.tokenInfo.symbol}</p>
              <button
                onClick={handleCopy}
                className="text-foreground/50 hover:text-primary transition-colors flex-shrink-0"
                title="Copy address"
              >
                {copied ? <FaCheck className="text-xs" /> : <FaCopy className="text-xs" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-y-1">
          <span className="text-foreground/50 text-xs">Market Cap</span>
          <span className="text-foreground text-lg font-bold">
            {formatCurrency(tokenData.tokenInfo.marketCap)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;

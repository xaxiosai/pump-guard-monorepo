import { Link } from "react-router-dom";
import { format } from "timeago.js";
import { useEffect, useState } from "react";
import { useLastScannedStore } from "~/stores/lastScannedStore";
import { formatCurrency } from "~/utils/format";

const LastScannedTokens = () => {
  const tokens = useLastScannedStore((state) => state.tokens);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (tokens.length === 0) return null;

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { level: "Low Risk", color: "text-green-500" };
    if (score >= 40) return { level: "Medium Risk", color: "text-yellow-500" };
    return { level: "High Risk", color: "text-red-500" };
  };

  return (
    <section className="px-content pt-4 pb-6 border-b border-border-primary">
      <h3 className="text-xl font-bold mb-4">Recently Scanned by Community</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tokens.map((token) => (
          <Link
            key={token.tokenAddress}
            to={`/report/${token.tokenAddress}`}
            className="flex flex-col p-6 bg-background-secondary border border-border-primary rounded-xl hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              {token.image ? (
                <img src={token.image} alt={token.symbol} className="w-14 h-14 rounded-xl" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-2xl font-bold">{token.symbol.charAt(0)}</span>
                </div>
              )}
              <div className="flex flex-col flex-1">
                <span className="text-foreground font-semibold text-lg truncate">
                  {token.name}
                </span>
                <span className="text-foreground/60 text-sm">${token.symbol}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-foreground/60">Market Cap</span>
              <span className="text-foreground font-semibold">{formatCurrency(token.marketCap)}</span>
            </div>

            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-foreground/60">Risk Score</span>
              <span className={`font-bold ${getRiskLevel(token.score || 0).color}`}>
                {(token.score || 0).toFixed(0)}%
              </span>
            </div>

            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-foreground/60">Risk Level</span>
              <span className={`font-semibold ${getRiskLevel(token.score || 0).color}`}>
                {getRiskLevel(token.score || 0).level}
              </span>
            </div>

            <div className="text-xs text-foreground/40 text-center pt-3 border-t border-border-primary">
              {token.timestamp ? format(token.timestamp * 1000) : 'Just now'}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default LastScannedTokens;

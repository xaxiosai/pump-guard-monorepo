import { Link, useParams } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { format } from "timeago.js";
import { useEffect, useState } from "react";
import { useRecentSearchesStore } from "~/stores/recentSearchesStore";
import { formatCurrency } from "~/utils/format";
import CircularScore from "~/components/features/report/CircularScore";

const RecentSearchTabs = () => {
  const { tokenAddress } = useParams();
  const searches = useRecentSearchesStore((state) => state.searches);
  const removeSearch = useRecentSearchesStore((state) => state.removeSearch);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (searches.length === 0) return null;

  const handleRemove = (e: React.MouseEvent, address: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeSearch(address);
  };

  return (
    <div className="border-b border-border-primary overflow-x-auto">
      <div className="flex items-center gap-2 px-content py-2 min-w-max">
        {searches.map((search) => {
          const isActive = tokenAddress === search.tokenAddress;
          return (
            <Link
              key={search.tokenAddress}
              to={`/report/${search.tokenAddress}`}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border-primary hover:border-primary/50"
              }`}
            >
              <CircularScore
                score={search.score}
                image={search.image}
                symbol={search.symbol}
                size={24}
                strokeWidth={2.5}
              />
              <span className="text-sm font-medium text-foreground">${search.symbol}</span>
              <span className="text-xs font-semibold text-foreground/60">{formatCurrency(search.marketCap)}</span>
              <span className="text-xs text-foreground/40">{format(search.timestamp)}</span>
              <button
                onClick={(e) => handleRemove(e, search.tokenAddress)}
                className="text-foreground/40 hover:text-foreground/80 transition-colors"
              >
                <FaTimes className="text-[10px]" />
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RecentSearchTabs;

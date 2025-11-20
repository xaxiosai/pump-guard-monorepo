import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import Button from "~/components/ui/Button";
import { useTokensScannedStore } from "~/stores/tokensScannedStore";
import { formatNumberWithCommas } from "~/utils/format";

const HeroSection = () => {
  const [tokenAddress, setTokenAddress] = useState("");
  const navigate = useNavigate();
  const tokensScanned = useTokensScannedStore((state) => state.count);

  const handleScan = () => {
    if (tokenAddress.trim()) {
      navigate(`/report/${tokenAddress.trim()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleScan();
    }
  };

  return (
    <section className="flex flex-col px-content mt-20 gap-y-12 border-b border-border-primary pb-8">
      <div className="flex flex-col gap-y-8">
        <h2 className="text-5xl font-bold">
          Trade <i className="text-primary">safer</i> on <span className="text-primary">Solana</span>
        </h2>

        <div className="flex items-center gap-x-2 max-w-3xl">
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter token address"
            className="flex-1 px-4 py-2.5 bg-background border border-border-primary rounded-md text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
          />
          <Button
            variant="primary"
            onClick={handleScan}
            className="px-4 py-2.5"
          >
            <FaSearch className="text-base" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-y-10">
        <p className="text-foreground text-lg max-w-80">
          Scan pump.fun tokens for risks. Detect manipulation before you trade.
        </p>

        <div className="flex flex-col gap-y-2 md:items-end">
          <h3 className="text-foreground text-sm tracking-wider">
            TOKENS SCANNED
          </h3>
          <p className="text-5xl font-bold text-foreground">
            {formatNumberWithCommas(tokensScanned)}
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

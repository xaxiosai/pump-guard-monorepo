import { useEffect, useRef, useId } from "react";
import type { ReactNode } from "react";
import { useTooltipStore } from "~/stores/tooltipStore";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

const Tooltip = ({ content, children }: TooltipProps) => {
  const tooltipId = useId();
  const activeTooltip = useTooltipStore((state) => state.activeTooltip);
  const setActiveTooltip = useTooltipStore((state) => state.setActiveTooltip);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isVisible = activeTooltip === tooltipId;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setActiveTooltip(null);
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, setActiveTooltip]);

  const handleInteraction = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTooltip(isVisible ? null : tooltipId);
  };

  const handleMouseEnter = () => {
    if (window.matchMedia('(hover: hover)').matches) {
      setActiveTooltip(tooltipId);
    }
  };

  const handleMouseLeave = () => {
    if (window.matchMedia('(hover: hover)').matches) {
      setActiveTooltip(null);
    }
  };

  return (
    <div className="relative inline-block" ref={tooltipRef}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleInteraction}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2.5 bg-background border border-border-primary rounded-lg shadow-xl backdrop-blur-sm whitespace-nowrap">
          <div className="text-xs text-foreground">{content}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-[5px] border-transparent border-t-background"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;

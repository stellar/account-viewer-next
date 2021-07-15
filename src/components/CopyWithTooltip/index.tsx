import React, { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import "./styles.scss";

enum TooltipPosition {
  bottom = "bottom",
  right = "right",
}

interface CopyWithTooltipComponent {
  tooltipPosition: typeof TooltipPosition;
}

interface CopyWithTooltipProps {
  copyText: string;
  tooltipLabel?: string;
  tooltipPosition?: TooltipPosition;
  children: React.ReactNode;
}

export const CopyWithTooltip: React.FC<CopyWithTooltipProps> &
  CopyWithTooltipComponent = ({
  copyText,
  tooltipLabel = "Copied",
  tooltipPosition = TooltipPosition.bottom,
  children,
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const handleCopyDone = () => {
    if (isTooltipVisible) {
      return;
    }

    setIsTooltipVisible(true);

    const t = setTimeout(() => {
      setIsTooltipVisible(false);
      clearTimeout(t);
    }, 1000);
  };

  const customStyle = {
    "--CopyWithTooltip-visibility": isTooltipVisible ? "visible" : "hidden",
  } as React.CSSProperties;

  return (
    <div className="CopyWithTooltip">
      <CopyToClipboard text={copyText} onCopy={handleCopyDone}>
        {children}
      </CopyToClipboard>
      <div
        className={`CopyWithTooltip__tooltip CopyWithTooltip__tooltip--${tooltipPosition}`}
        style={customStyle}
      >
        {tooltipLabel}
      </div>
    </div>
  );
};

CopyWithTooltip.displayName = "CopyWithTooltip";
CopyWithTooltip.tooltipPosition = TooltipPosition;

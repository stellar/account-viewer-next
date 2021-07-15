import { InfoButtonWithTooltip } from "components/InfoButtonWithTooltip";
import { renderSvg } from "helpers/renderSvg";
import "./styles.scss";

interface WalletButtonProps {
  imageSvg: React.ReactNode;
  imageAlt: string;
  infoText: string | React.ReactNode;
  onClick: () => void;
  children: string;
}

export const WalletButton: React.FC<WalletButtonProps> = ({
  imageSvg,
  imageAlt,
  infoText,
  onClick,
  children,
  ...props
}) => (
  <div className="WalletButton">
    <button onClick={onClick} {...props}>
      {renderSvg({ Component: imageSvg, alt: imageAlt })}
      <span>{children}</span>
    </button>

    <InfoButtonWithTooltip>{infoText}</InfoButtonWithTooltip>
  </div>
);

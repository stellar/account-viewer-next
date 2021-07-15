import React from "react";
import "./styles.scss";

interface KeyPairWithLabelsProps {
  publicKey: string;
  secretKey: string;
}

export const KeyPairWithLabels: React.FC<KeyPairWithLabelsProps> = ({
  publicKey,
  secretKey,
}) => (
  <div className="KeyPairWithLabels">
    <div className="KeyPairWithLabels-wrapper">
      <label>Public key</label>
      <code data-break>{publicKey}</code>
    </div>

    <div className="KeyPairWithLabels-wrapper">
      <label>Secret key</label>
      <code data-break>{secretKey}</code>
    </div>
  </div>
);

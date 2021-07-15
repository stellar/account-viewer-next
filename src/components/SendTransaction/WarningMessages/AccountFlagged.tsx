import { InfoBlock } from "@stellar/design-system";

export const AccountFlagged = ({ flagType = "" }) => (
  <InfoBlock variant={InfoBlock.variant.error}>
    <p>
      This destination account has been flagged as being potentially {flagType}.
    </p>
  </InfoBlock>
);

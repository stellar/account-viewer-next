import styled from "styled-components";
import { Button, TextLink } from "@stellar/design-system";
import { ModalContent } from "components/ModalContent";
import { useRedux } from "hooks/useRedux";
import { getNetworkConfig } from "helpers/getNetworkConfig";

const ContentEl = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const SuccessfulTransaction = ({
  onRestartFlow,
  onCancel,
}: {
  onRestartFlow: () => void;
  onCancel: () => void;
}) => {
  const { sendTx, settings } = useRedux("sendTx", "settings");

  if (!sendTx.data) {
    return null;
  }

  return (
    <ModalContent
      headlineText="Transaction successfully completed"
      buttonFooter={
        <>
          <Button onClick={onRestartFlow}>Send another payment</Button>
          <Button onClick={onCancel} variant={Button.variant.secondary}>
            Close
          </Button>
        </>
      }
    >
      <ContentEl>
        <TextLink
          href={`${getNetworkConfig(settings.isTestnet).stellarExpertTxUrl}${
            sendTx.data.id
          }`}
          target="_blank"
          rel="noopener"
        >
          See details on StellarExpert
        </TextLink>
      </ContentEl>
    </ModalContent>
  );
};

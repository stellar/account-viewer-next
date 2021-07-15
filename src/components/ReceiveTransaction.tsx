import styled from "styled-components";
import QRCode from "qrcode.react";
import { TextLink } from "@stellar/design-system";

import { ReactComponent as IconCopy } from "assets/svg/icon-copy.svg";

import { Avatar } from "components/Avatar";
import { CopyWithTooltip } from "components/CopyWithTooltip";
import { ModalContent } from "components/ModalContent";
import { FONT_WEIGHT, PALETTE } from "constants/styles";
import { useRedux } from "hooks/useRedux";

const QRCodeWrapperEl = styled.div`
  margin: 2.5rem 0;
  display: flex;
  justify-content: center;
`;

const ContentWrapperEl = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DescriptionEl = styled.p`
  text-align: center;
`;

const AddressWrapperEl = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
`;

const AddressEl = styled.div`
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: ${FONT_WEIGHT.medium};
  color: ${PALETTE.black};
  word-break: break-all;
  margin-left: 1.5rem;
  max-width: 300px;
  flex: 1;
`;

export const ReceiveTransaction = () => {
  const { account } = useRedux("account");

  if (!account.data) {
    return null;
  }

  const accountId = account.data.id;

  return (
    <ModalContent headlineText="Your account QR code">
      <DescriptionEl>
        Scan this QR code using a Stellar wallet app to make a payment to your
        account.
      </DescriptionEl>

      <QRCodeWrapperEl>
        <QRCode value={accountId}></QRCode>
      </QRCodeWrapperEl>

      <ContentWrapperEl>
        <AddressWrapperEl>
          <Avatar publicAddress={accountId} />
          <AddressEl>{accountId}</AddressEl>
        </AddressWrapperEl>

        <CopyWithTooltip
          copyText={accountId}
          tooltipPosition={CopyWithTooltip.tooltipPosition.right}
        >
          <TextLink iconLeft={<IconCopy />}>Copy public key</TextLink>
        </CopyWithTooltip>
      </ContentWrapperEl>
    </ModalContent>
  );
};

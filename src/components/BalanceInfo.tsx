import { useState, useEffect } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { Button, Heading3, TextLink } from "@stellar/design-system";

import { ReactComponent as IconReceive } from "assets/svg/icon-receive.svg";
import { ReactComponent as IconSend } from "assets/svg/icon-send.svg";

import { SendTransactionFlow } from "components/SendTransaction/SendTransactionFlow";
import { ReceiveTransaction } from "components/ReceiveTransaction";
import { Modal } from "components/Modal";
import { FONT_WEIGHT, pageInsetStyle, PALETTE } from "constants/styles";
import { startAccountWatcherAction } from "ducks/account";
import { resetSendTxAction } from "ducks/sendTx";
import { logEvent } from "helpers/tracking";
import { useRedux } from "hooks/useRedux";
import { ActionStatus } from "types/types.d";

const WrapperEl = styled.div`
  background-color: ${PALETTE.white80};
`;

const InsetEl = styled.div`
  ${pageInsetStyle};
  padding-top: 2rem;
  padding-bottom: 2.4rem;
  margin-top: 2rem;
  margin-bottom: 3rem;

  @media (min-width: 900px) {
    padding-top: 4.5rem;
    padding-bottom: 4.5rem;
  }
`;

const BalanceInfoEl = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (min-width: 900px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const BalanceWrapperEl = styled.div`
  margin-bottom: 2rem;
  text-align: center;

  @media (min-width: 900px) {
    margin-bottom: 0;
    text-align: left;
  }
`;

const ButtonsWrapperEl = styled.div`
  display: flex;
  align-items: center;

  button:first-child {
    margin-right: 1.5rem;
  }
`;

const BalanceEl = styled.div`
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: ${FONT_WEIGHT.medium};
  color: ${PALETTE.black};
  margin-top: 0.5rem;

  @media (min-width: 500px) {
    font-size: 2rem;
    line-height: 2.5rem;
  }

  @media (min-width: 900px) {
    margin-top: 1rem;
  }
`;

const UnfundedAccountEl = styled.div`
  margin-top: 3rem;
`;

const PublicKeyEl = styled.div`
  font-size: 2rem;
  line-height: 2.5rem;
  color: ${PALETTE.black};
  padding-top: 0.5rem;
  padding-bottom: 1.5rem;
  word-break: break-all;
`;

const WarningEl = styled.p`
  display: inline-block;
  padding: 1rem;
  background-color: ${PALETTE.lightYellow};
`;

export const BalanceInfo = () => {
  const dispatch = useDispatch();
  const { account } = useRedux("account");
  const { flaggedAccounts } = useRedux("flaggedAccounts");
  const {
    status: accountStatus,
    data,
    isAccountWatcherStarted,
    isUnfunded,
  } = account;
  const { status: flaggedAccountsStatus } = flaggedAccounts;
  const [isSendTxModalVisible, setIsSendTxModalVisible] = useState(false);
  const [isReceiveTxModalVisible, setIsReceiveTxModalVisible] = useState(false);
  const publicAddress = data?.id;

  useEffect(() => {
    if (
      publicAddress &&
      accountStatus === ActionStatus.SUCCESS &&
      !isAccountWatcherStarted
    ) {
      dispatch(startAccountWatcherAction(publicAddress));
    }
  }, [dispatch, publicAddress, accountStatus, isAccountWatcherStarted]);

  let nativeBalance = "0";

  if (account.data) {
    nativeBalance = account.data.balances
      ? account.data.balances.native.total.toString()
      : "0";
  }

  const resetModalStates = () => {
    dispatch(resetSendTxAction());
    setIsSendTxModalVisible(false);
    setIsReceiveTxModalVisible(false);
  };

  if (!data) {
    return null;
  }

  return (
    <WrapperEl>
      <InsetEl>
        <BalanceInfoEl>
          <BalanceWrapperEl>
            <Heading3>Your Balance</Heading3>
            <BalanceEl>{nativeBalance} Lumens (XLM)</BalanceEl>
          </BalanceWrapperEl>

          <ButtonsWrapperEl>
            <Button
              onClick={() => {
                setIsSendTxModalVisible(true);
                logEvent("send: clicked start send");
              }}
              iconLeft={<IconSend />}
              disabled={
                isUnfunded || flaggedAccountsStatus !== ActionStatus.SUCCESS
              }
            >
              Send
            </Button>
            <Button
              onClick={() => {
                setIsReceiveTxModalVisible(true);
                logEvent("receive: clicked receive");
              }}
              iconLeft={<IconReceive />}
            >
              Receive
            </Button>
          </ButtonsWrapperEl>
        </BalanceInfoEl>

        {isUnfunded && (
          <UnfundedAccountEl>
            <Heading3>Your Stellar Public Key</Heading3>
            <PublicKeyEl>{publicAddress}</PublicKeyEl>
            <WarningEl>
              This account is currently inactive. To activate it,{" "}
              <TextLink
                href="https://developers.stellar.org/docs/glossary/minimum-balance/"
                target="_blank"
                rel="noreferrer"
              >
                send at least 1 lumen (XLM)
              </TextLink>{" "}
              to the Stellar public key displayed above.
            </WarningEl>
          </UnfundedAccountEl>
        )}

        <Modal
          visible={isSendTxModalVisible || isReceiveTxModalVisible}
          onClose={resetModalStates}
        >
          {isSendTxModalVisible && (
            <SendTransactionFlow
              onCancel={() => {
                setIsSendTxModalVisible(true);
                resetModalStates();
              }}
            />
          )}
          {isReceiveTxModalVisible && <ReceiveTransaction />}
        </Modal>
      </InsetEl>
    </WrapperEl>
  );
};

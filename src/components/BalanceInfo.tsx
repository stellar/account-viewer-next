import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";

import { ReactComponent as IconReceive } from "assets/svg/icon-receive.svg";
import { ReactComponent as IconSend } from "assets/svg/icon-send.svg";

import { Button } from "components/basic/Button";
import { Heading3 } from "components/basic/Heading";
import { SendTransactionFlow } from "components/SendTransaction/SendTransactionFlow";
import { ReceiveTransaction } from "components/ReceiveTransaction";
import { Modal } from "components/Modal";
import { FONT_WEIGHT, pageInsetStyle, PALETTE } from "constants/styles";
import { startAccountWatcherAction } from "ducks/account";
import { resetSendTxAction } from "ducks/sendTx";
import { useRedux } from "hooks/useRedux";
import { ActionStatus } from "types/types.d";

const WrapperEl = styled.div`
  background-color: ${PALETTE.white80};
`;

const InsetEl = styled.div`
  ${pageInsetStyle};
  padding-top: 2rem;
  padding-bottom: 2.4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
  margin-bottom: 3rem;

  @media (min-width: 900px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-top: 4.5rem;
    padding-bottom: 4.5rem;
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

export const BalanceInfo = () => {
  const dispatch = useDispatch();
  const { account } = useRedux("account");
  const { status, data, isAccountWatcherStarted } = account;
  const [isSendTxModalVisible, setIsSendTxModalVisible] = useState(false);
  const [isReceiveTxModalVisible, setIsReceiveTxModalVisible] = useState(false);
  const publicAddress = data.id;

  useEffect(() => {
    if (status === ActionStatus.SUCCESS && !isAccountWatcherStarted) {
      dispatch(startAccountWatcherAction(publicAddress));
    }
  }, [dispatch, publicAddress, status, isAccountWatcherStarted]);

  let nativeBalance = 0;

  if (account.data) {
    nativeBalance = account.data.balances
      ? account.data.balances.native.total.toString()
      : 0;
  }

  const resetModalStates = () => {
    dispatch(resetSendTxAction());
    setIsSendTxModalVisible(false);
    setIsReceiveTxModalVisible(false);
  };

  return (
    <WrapperEl>
      <InsetEl>
        <BalanceWrapperEl>
          <Heading3>Your Balance</Heading3>
          <BalanceEl>{nativeBalance} Lumens (XLM)</BalanceEl>
        </BalanceWrapperEl>

        <ButtonsWrapperEl>
          <Button
            onClick={() => setIsSendTxModalVisible(true)}
            icon={<IconSend />}
            disabled={data.isUnfunded}
          >
            Send
          </Button>
          <Button
            onClick={() => setIsReceiveTxModalVisible(true)}
            icon={<IconReceive />}
          >
            Receive
          </Button>
        </ButtonsWrapperEl>

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

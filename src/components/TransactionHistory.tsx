import React, { useEffect, useState } from "react";
import moment from "moment";
import styled, { css } from "styled-components";
import StellarSdk, { Horizon } from "stellar-sdk";
import { useDispatch } from "react-redux";
import { BigNumber } from "bignumber.js";
import { Types } from "@stellar/wallet-sdk";

import {
  fetchTxHistoryAction,
  startTxHistoryWatcherAction,
} from "ducks/txHistory";
import { useErrorMessage } from "hooks/useErrorMessage";
import { useRedux } from "hooks/useRedux";
import { getNetworkConfig } from "helpers/getNetworkConfig";
import { getFormattedPublicKey } from "helpers/getFormattedPublicKey";
import { Avatar } from "components/Avatar";
import { Heading2 } from "components/basic/Heading";
import { TextButton, TextButtonVariant } from "components/basic/TextButton";
import { ErrorMessage } from "components/ErrorMessage";
import { TextLink } from "components/basic/TextLink";

import { TX_HISTORY_MIN_AMOUNT } from "constants/settings";
import { FONT_WEIGHT, pageInsetStyle, PALETTE } from "constants/styles";
import { ActionStatus } from "types/types.d";

const COLUMN_LAYOUT_WIDTH = "800px";

const LABEL_DATE_TIME = "Date/Time";
const LABEL_ADDRESS = "Address";
const LABEL_AMOUNT = "Amount";
const LABEL_MEMO = "Memo";
const LABEL_OPERATION_ID = "Operation ID";

const WrapperEl = styled.div`
  ${pageInsetStyle};
  padding-bottom: 2rem;
`;

const HeadingRowEl = styled.div`
  display: block;

  h2 {
    margin-bottom: 1rem;
  }

  @media (min-width: 680px) {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin-bottom: 0;
    }
  }

  @media (min-width: ${COLUMN_LAYOUT_WIDTH}) {
    margin-bottom: 2rem;
  }
`;

const TxToggleLinkEl = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

  button {
    margin-left: -0.2rem;
    margin-top: 0.2rem;
  }

  @media (min-width: 680px) {
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;

    button {
      margin-left: 0.5rem;
      margin-top: -0.25rem;
    }
  }
`;

const LabelStyle = css`
  font-size: 0.875rem;
  line-height: 1.125rem;
  color: ${PALETTE.black60};
  font-weight: ${FONT_WEIGHT.medium};
  text-transform: uppercase;
  text-align: left;
  padding-bottom: 1.0625rem;
`;

const TableEl = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${PALETTE.black};

  th {
    ${LabelStyle};
  }

  thead,
  tr:not(:last-child) {
    border-bottom: 1px solid ${PALETTE.white60};
  }

  @media (min-width: ${COLUMN_LAYOUT_WIDTH}) {
    th,
    td {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
      vertical-align: top;
    }

    th:first-child,
    td:first-child {
      padding-left: 0;
    }

    th:last-child,
    td:last-child {
      padding-right: 0;
    }

    td {
      padding-top: 1.5rem;
      padding-bottom: 1.5rem;
    }

    th:nth-of-type(3),
    th:nth-of-type(5),
    td:nth-of-type(3),
    td:nth-of-type(5) {
      text-align: right;
    }
  }

  @media (max-width: ${COLUMN_LAYOUT_WIDTH}) {
    thead,
    tbody,
    th,
    td,
    tr {
      display: block;
    }

    thead {
      border-bottom: none;

      /* Hide table headers (but not "display: none" for accessibility) */
      tr {
        position: absolute;
        top: -9999px;
        left: -9999px;
      }
    }

    tr {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }

    td {
      position: relative;
      padding-left: 50%;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      text-align: right;
    }

    td::before {
      ${LabelStyle};
      position: absolute;
      white-space: nowrap;
      top: 0.5rem;
      left: 0;
      line-height: 1.5rem;
    }

    /*
    Labels
    */
    td:nth-of-type(1)::before {
      content: "${LABEL_DATE_TIME}";
    }
    td:nth-of-type(2)::before {
      content: "${LABEL_ADDRESS}";
    }
    td:nth-of-type(3)::before {
      content: "${LABEL_AMOUNT}";
    }
    td:nth-of-type(4)::before {
      content: "${LABEL_MEMO}";
    }
    td:nth-of-type(5)::before {
      content: "${LABEL_OPERATION_ID}";
    }
  }
`;

const AddressEl = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  & > div {
    margin-top: -0.25rem;
    margin-right: 0.75rem;
  }

  @media (max-width: 500px) {
    margin-top: 0;

    & > div {
      display: none;
    }
  }

  @media (min-width: 500px) and (max-width: ${COLUMN_LAYOUT_WIDTH}) {
    margin-top: -0.5rem;
  }

  @media (min-width: ${COLUMN_LAYOUT_WIDTH}) {
    justify-content: flex-start;
    margin-top: -0.5rem;
  }

  @media (min-width: ${COLUMN_LAYOUT_WIDTH}) and (max-width: 980px) {
    margin-top: 0;

    & > div {
      display: none;
    }
  }
`;

const MemoEl = styled.div`
  min-height: 1.5rem;

  span {
    display: block;
  }
`;

const BottomLinkEl = styled.div`
  padding-top: 1.5rem;
  border-top: 1px solid ${PALETTE.white60};
`;

export const TransactionHistory = () => {
  const { account, txHistory, settings } = useRedux(
    "account",
    "txHistory",
    "settings",
  );
  const accountId = account.data?.id;
  const isUnfunded = account.data?.isUnfunded;
  const dispatch = useDispatch();
  const [showAllTxs, setShowAllTxs] = useState(false);
  const {
    status,
    data,
    isTxWatcherStarted,
    errorString,
    hasMoreTxs,
  } = txHistory;

  const { errorMessage } = useErrorMessage({ initialMessage: errorString });

  useEffect(() => {
    if (accountId && !isUnfunded) {
      dispatch(fetchTxHistoryAction(accountId));
    }
  }, [accountId, isUnfunded, dispatch]);

  useEffect(() => {
    if (status === ActionStatus.SUCCESS && !isTxWatcherStarted) {
      dispatch(startTxHistoryWatcherAction(accountId));
    }
  }, [status, isTxWatcherStarted, accountId, dispatch]);

  const filterOutSmallAmounts = (transactions: Types.Payment[]) =>
    transactions.filter((tx) =>
      new BigNumber(tx.amount).gt(TX_HISTORY_MIN_AMOUNT),
    );

  const visibleTransactions = showAllTxs ? data : filterOutSmallAmounts(data);
  const hasHiddenTransactions =
    data.length - filterOutSmallAmounts(data).length > 0;
  const hasVisibleTransactions =
    visibleTransactions && visibleTransactions.length > 0;

  const getFormattedAmount = (pt: Types.Payment) => {
    if (!pt?.amount) {
      return "";
    }
    const amount = new BigNumber(pt.amount).toString();
    const { isRecipient, token } = pt;
    return `${(isRecipient ? "+" : "-") + amount} ${token.code}`;
  };

  const getFormattedMemo = (pt: Types.Payment) => {
    let memoType;
    switch (pt.memoType) {
      case StellarSdk.MemoText:
        memoType = "MEMO_TEXT";
        break;
      case StellarSdk.MemoHash:
        memoType = "MEMO_HASH";
        break;
      case StellarSdk.MemoID:
        memoType = "MEMO_ID";
        break;
      case StellarSdk.MemoReturn:
        memoType = "MEMO_RETURN";
        break;
      default:
        memoType = "";
        break;
    }

    return (
      <MemoEl aria-hidden={!memoType && !pt.memo}>
        {memoType && <span>{memoType}</span>}
        {pt.memo && <span>{pt.memo}</span>}
      </MemoEl>
    );
  };

  const isAccountMerge = (pt: Types.Payment) => pt.type === Horizon.OperationResponseType.accountMerge;

  return (
    <WrapperEl>
      <HeadingRowEl>
        <Heading2>Payments History</Heading2>
        {hasHiddenTransactions && (
          <TxToggleLinkEl>
            {`${
              showAllTxs ? "Including" : "Hiding"
            } payments smaller than 0.5 XLM`}{" "}
            <TextButton
              onClick={() => setShowAllTxs(!showAllTxs)}
              variant={TextButtonVariant.secondary}
            >
              {showAllTxs ? "Hide small payments" : "Show all"}
            </TextButton>
          </TxToggleLinkEl>
        )}
      </HeadingRowEl>

      <ErrorMessage message={errorMessage} marginBottom="2rem" />

      {!hasVisibleTransactions && <p>There are no payments to show</p>}

      {hasVisibleTransactions && (
        <>
          <TableEl>
            <thead>
              <tr>
                <th>{LABEL_DATE_TIME}</th>
                <th>{LABEL_ADDRESS}</th>
                <th>{LABEL_AMOUNT}</th>
                <th>{LABEL_MEMO}</th>
                <th>{LABEL_OPERATION_ID}</th>
              </tr>
            </thead>
            <tbody>
              {visibleTransactions?.map((pt: Types.Payment) => (
                <tr key={pt.id}>
                  <td>{moment.unix(pt.timestamp).format("l HH:mm")}</td>
                  <td>
                    {isAccountMerge(pt) ? (
                      "[account merge]"
                    ) : (
                      <AddressEl>
                        <Avatar publicAddress={pt.otherAccount?.publicKey} />{" "}
                        {getFormattedPublicKey(pt.otherAccount?.publicKey)}
                      </AddressEl>
                    )}
                  </td>
                  <td>{getFormattedAmount(pt)}</td>
                  <td>{getFormattedMemo(pt)}</td>
                  <td>
                    <TextLink
                      href={`${
                        getNetworkConfig(settings.isTestnet).stellarExpertTxUrl
                      }${pt.transactionId}`}
                      target="_blank"
                      rel="noopener"
                    >
                      {pt.id}
                    </TextLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableEl>
          {hasMoreTxs && (
            <BottomLinkEl>
              <TextLink
                href={`${
                  getNetworkConfig(settings.isTestnet).stellarExpertAccountUrl
                }${accountId}`}
                target="_blank"
                rel="noopener"
              >
                View full list of transactions
              </TextLink>
            </BottomLinkEl>
          )}
        </>
      )}
    </WrapperEl>
  );
};

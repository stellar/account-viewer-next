import React, { useEffect } from "react";
import { fetchAccountTxHistory } from "ducks/txHistory";
import { useDispatch } from "react-redux";
import { useRedux } from "hooks/useRedux";
import styled from "styled-components";

const El = styled.div`
  padding-bottom: 10px;
`;

export const TransactionHistory = () => {
  const { account, txHistory } = useRedux(["account", "txHistory"]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (account.data) {
      dispatch(fetchAccountTxHistory(account.data.id));
    }
  }, [account.data?.id]);

  return (
    <El>
      <El>Payments History</El>
      <El>
        {txHistory.records?.map((pt: any) => (
          <El key={pt.id}>{pt.id}</El>
        ))}
      </El>
    </El>
  );
};

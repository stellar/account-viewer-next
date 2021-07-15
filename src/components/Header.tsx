import styled from "styled-components";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Layout, TextLink } from "@stellar/design-system";

import { ReactComponent as IconCopy } from "assets/svg/icon-copy.svg";
import { resetStoreAction } from "config/store";
import { Avatar } from "components/Avatar";
import { CopyWithTooltip } from "components/CopyWithTooltip";
import {
  FONT_WEIGHT,
  HEADER_HEIGHT_REM,
  MEDIA_QUERIES,
  PALETTE,
} from "constants/styles";
import { stopAccountWatcherAction } from "ducks/account";
import { stopTxHistoryWatcherAction } from "ducks/txHistory";
import { getFormattedPublicKey } from "helpers/getFormattedPublicKey";
import { useRedux } from "hooks/useRedux";

const BaseEl = styled.div`
  height: ${HEADER_HEIGHT_REM}rem;
  display: flex;
  align-items: center;
`;

const AccountWrapperEl = styled(BaseEl)`
  justify-content: center;
  order: 1;
  width: 100%;
  margin-top: 1.2rem;

  @media (${MEDIA_QUERIES.headerFooterHeight}) {
    width: auto;
    order: 0;
    flex: 1;
    justify-content: flex-end;
    margin-top: 0;
  }
`;

const SignOutWrapperEl = styled(BaseEl)``;

const CopyPublicKeyButtonEl = styled.div`
  display: flex;
  position: relative;
  align-items: center;
  margin-left: 0.75rem;
  margin-right: 0;
  margin-top: 0.25rem;
  font-size: 1rem;
  line-height: 1.75rem;
  font-weight: ${FONT_WEIGHT.medium};
  color: ${PALETTE.black};

  &:hover {
    opacity: 0.7;
  }

  svg {
    fill: ${PALETTE.purple};
    height: 1.25rem;
    width: 1.25rem;
    margin-left: 0.75rem;
    margin-top: -0.25rem;
  }

  &::after {
    content: "";
    cursor: default;
    display: none;
    width: 1px;
    height: 2rem;
    background-color: ${PALETTE.grey};
    position: absolute;
    top: -0.2rem;
    right: -1.5rem;
  }

  @media (${MEDIA_QUERIES.headerFooterHeight}) {
    margin-right: 2.6rem;

    &::after {
      display: block;
    }
  }
`;

export const Header = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { account } = useRedux("account");
  const { isAuthenticated } = account;

  const handleSignOut = () => {
    dispatch(stopAccountWatcherAction());
    dispatch(stopTxHistoryWatcherAction());
    dispatch(resetStoreAction());
    history.push({
      pathname: "/",
    });
  };

  return (
    <Layout.Header
      projectTitle="Account Viewer"
      projectLink="https://stellar.org"
      hasDarkModeToggle
    >
      {isAuthenticated && account.data && (
        <>
          <AccountWrapperEl>
            <Avatar publicAddress={account.data.id} />
            <CopyWithTooltip copyText={account.data.id}>
              <CopyPublicKeyButtonEl>
                {getFormattedPublicKey(account.data.id)}
                <IconCopy />
              </CopyPublicKeyButtonEl>
            </CopyWithTooltip>
          </AccountWrapperEl>
          <SignOutWrapperEl>
            <TextLink role="button" onClick={handleSignOut}>
              Sign out
            </TextLink>
          </SignOutWrapperEl>
        </>
      )}
    </Layout.Header>
  );
};

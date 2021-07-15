import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { Keypair } from "stellar-sdk";
import {
  Button,
  Heading4,
  InfoBlock,
  Input,
  TextLink,
  Modal,
  Checkbox,
} from "@stellar/design-system";
import { KeyType } from "@stellar/wallet-sdk";

import { ReactComponent as UrlIllustration } from "assets/svg/url-illustration.svg";

import { ErrorMessage } from "components/ErrorMessage";

import { fetchAccountAction, resetAccountAction } from "ducks/account";
import { storeKeyAction } from "ducks/keyStore";
import { updateSettingsAction } from "ducks/settings";
import { logEvent } from "helpers/tracking";
import { useErrorMessage } from "hooks/useErrorMessage";
import { useRedux } from "hooks/useRedux";
import { ActionStatus, AuthType, ModalPageProps } from "types/types.d";

const InputWrapperEl = styled.div`
  margin-top: 1.5rem;
`;

const IllustrationWrapperEl = styled.div`
  margin-bottom: 1rem;

  svg {
    width: 100%;
    height: 100%;
  }
`;

export const SignInSecretKeyForm = ({ onClose }: ModalPageProps) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const { account } = useRedux("account");
  const { status, isAuthenticated, errorString, data } = account;
  const accountId = data?.id;
  const [showSecretKeyView, setShowSecretKeyView] = useState(false);
  const [acceptedWarning, setAcceptedWarning] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const { errorMessage, setErrorMessage } = useErrorMessage({
    initialMessage: errorString,
    onUnmount: () => {
      dispatch(resetAccountAction());
    },
  });

  useEffect(() => {
    logEvent("login: saw connect with secret key warning");
  }, []);

  useEffect(() => {
    if (status === ActionStatus.SUCCESS) {
      if (isAuthenticated && accountId) {
        history.push({
          pathname: "/dashboard",
          search: history.location.search,
        });
        dispatch(updateSettingsAction({ authType: AuthType.PRIVATE_KEY }));
        dispatch(
          storeKeyAction({
            publicKey: accountId,
            privateKey: secretKey,
            keyType: KeyType.plaintextKey,
          }),
        );
        logEvent("login: connected with secret key");
      } else {
        setErrorMessage("Something went wrong, please try again.");
        logEvent("login: saw connect with secret key error", {
          message: errorString,
        });
      }
    }
  }, [
    status,
    history,
    isAuthenticated,
    setErrorMessage,
    dispatch,
    accountId,
    secretKey,
    errorString,
  ]);

  let failedAttempts = 0;

  const handleSignIn = () => {
    setErrorMessage("");

    if (!secretKey) {
      setErrorMessage("Please enter your secret key");
      logEvent("login: saw connect with secret key error", {
        message: "Please enter your secret key",
      });
      return;
    }

    if (failedAttempts > 8) {
      setErrorMessage(
        "Please wait a few seconds before attempting to log in again",
      );
      logEvent("login: saw connect with secret key error", {
        message: "Please wait a few seconds before attempting to log in again",
      });
      return;
    }

    try {
      const keypair = Keypair.fromSecret(secretKey);
      const publicKey = keypair.publicKey();

      dispatch(fetchAccountAction(publicKey));
    } catch (e) {
      // Rate limit with exponential backoff.
      failedAttempts += 1;
      setTimeout(() => {
        failedAttempts -= 1;
      }, 2 ** failedAttempts * 1000);

      setErrorMessage(
        `Invalid secret key. Secret keys are uppercase and begin with the letter "S."`,
      );
      logEvent("login: saw connect with secret key error", {
        message: "Invalid secret key",
      });
    }
  };

  return (
    <>
      {/* Show warning message */}
      {!showSecretKeyView && (
        <>
          <Modal.Heading>Connect with a secret key</Modal.Heading>

          <Modal.Body>
            <InfoBlock variant={InfoBlock.variant.error}>
              <Heading4>
                ATTENTION: Entering your secret key on any website is not
                recommended
              </Heading4>

              <ul>
                <li>
                  Copy and pasting your secret key makes you vulnerable to
                  accidents, attacks, and scams that can result in loss of
                  funds.
                </li>
                <li>
                  If this website were compromised or if you visit a phishing
                  replica of this site, your secret key may be stolen if you use
                  this method.
                </li>
                <li>
                  It is safer to use connection methods that do not share your
                  secret key with websites, such as hardware wallets or browser
                  extensions.
                </li>
                <li>
                  <strong>
                    Note: Connecting by entering a secret key may be deprecated
                    in a future version of the Account Viewer.
                  </strong>
                </li>
              </ul>
            </InfoBlock>

            <Checkbox
              id="secret-key-accept"
              label="I understand and accept the risks of entering my secret key."
              onChange={() => setAcceptedWarning(!acceptedWarning)}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button
              disabled={!acceptedWarning}
              onClick={() => setShowSecretKeyView(true)}
            >
              Continue
            </Button>

            <Button onClick={onClose} variant={Button.variant.secondary}>
              Cancel
            </Button>
          </Modal.Footer>
        </>
      )}

      {/* Show Enter secret key */}
      {showSecretKeyView && (
        <>
          <Modal.Heading>Connect with a secret key</Modal.Heading>

          <Modal.Body>
            <InfoBlock>
              <IllustrationWrapperEl>
                <UrlIllustration />
              </IllustrationWrapperEl>
              <p>
                Always make sure the domain you are using to access the Account
                Viewer is{" "}
                <TextLink href="https://accountviewer.stellar.org">
                  https://accountviewer.stellar.org
                </TextLink>{" "}
                before entering your keys. Scammers can replicate this website
                on a different domain to steal your keys.
              </p>

              <Heading4>
                Did you know that password managers are a safer alternative to
                copying and pasting your secret keys?
              </Heading4>
              <p>
                Password managers will autocomplete the secret key field only if
                they detect you're in the right domain. They also reduce risk by
                removing the need to copy and paste your secret key.
              </p>
            </InfoBlock>

            <InputWrapperEl>
              <Input
                id="enter-secret-key"
                placeholder="Starts with S, example: SCHK…ZLJK"
                onChange={() => setErrorMessage("")}
                onBlur={(e) => setSecretKey(e.currentTarget.value)}
                type="password"
                label="Your secret key"
              />
            </InputWrapperEl>

            <ErrorMessage message={errorMessage} marginTop="1rem" />
          </Modal.Body>

          <Modal.Footer>
            <Button
              onClick={handleSignIn}
              disabled={status === ActionStatus.PENDING}
            >
              Connect
            </Button>
          </Modal.Footer>
        </>
      )}
    </>
  );
};

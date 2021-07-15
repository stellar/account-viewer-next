import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Heading1, TextLink, Modal } from "@stellar/design-system";

import { NewKeyPairForm } from "components/NewKeyPairForm";
import { SignInAlbedoForm } from "components/SignIn/SignInAlbedoForm";
import { SignInLedgerForm } from "components/SignIn/SignInLedgerForm";
import { SignInFreighterForm } from "components/SignIn/SignInFreighterForm";
import { SignInSecretKeyForm } from "components/SignIn/SignInSecretKeyForm";
import { SignInTrezorForm } from "components/SignIn/SignInTrezorForm";
import { WalletButton } from "components/WalletButton";

import { wallets } from "constants/wallets";
import { resetAlbedoAction } from "ducks/wallet/albedo";
import { resetLedgerAction } from "ducks/wallet/ledger";
import { resetFreighterAction } from "ducks/wallet/freighter";
import { resetTrezorAction } from "ducks/wallet/trezor";
import { logEvent } from "helpers/tracking";
import { ModalType } from "types/types.d";

export const Landing = () => {
  const dispatch = useDispatch();
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);

  useEffect(() => {
    logEvent("page: saw authentication screen");
  }, []);

  const resetWalletState = (type: ModalType | null) => {
    switch (type) {
      case ModalType.SIGNIN_TREZOR:
        dispatch(resetTrezorAction());
        break;
      case ModalType.SIGNIN_LEDGER:
        dispatch(resetLedgerAction());
        break;
      case ModalType.SIGNIN_FREIGHTER:
        dispatch(resetFreighterAction());
        break;
      case ModalType.SIGNIN_ALBEDO:
        dispatch(resetAlbedoAction());
        break;
      default:
      // Do nothing
    }
  };

  const openModal = (type: ModalType) => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    resetWalletState(activeModal);
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case ModalType.SIGNIN_SECRET_KEY:
        return <SignInSecretKeyForm onClose={closeModal} />;
      case ModalType.SIGNIN_TREZOR:
        return <SignInTrezorForm onClose={closeModal} />;
      case ModalType.SIGNIN_LEDGER:
        return <SignInLedgerForm onClose={closeModal} />;
      case ModalType.SIGNIN_FREIGHTER:
        return <SignInFreighterForm onClose={closeModal} />;
      case ModalType.SIGNIN_ALBEDO:
        return <SignInAlbedoForm onClose={closeModal} />;
      case ModalType.NEW_KEY_PAIR:
        return <NewKeyPairForm onClose={closeModal} />;
      default:
        return null;
    }
  };

  return (
    <div className="Landing-container">
      <Heading1>Connect with a wallet</Heading1>

      <div className="WalletButtons-container">
        {Object.keys(wallets).map((walletKey) => {
          const wallet = wallets[walletKey];

          return (
            <WalletButton
              key={walletKey}
              onClick={() => openModal(wallet.modalType)}
              imageSvg={wallet.logoSvg}
              imageAlt={wallet.logoImgAltText}
              infoText={
                <>
                  {wallet.infoText}{" "}
                  <TextLink
                    href={wallet.infoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {wallet.infoLinkText}
                  </TextLink>
                </>
              }
            >
              {wallet.title}
            </WalletButton>
          );
        })}
      </div>

      <div className="Landing-buttons-wrapper">
        <TextLink
          role="button"
          onClick={() => openModal(ModalType.SIGNIN_SECRET_KEY)}
          variant={TextLink.variant.secondary}
          underline
        >
          Connect with a secret key
        </TextLink>

        <TextLink
          role="button"
          onClick={() => openModal(ModalType.NEW_KEY_PAIR)}
          variant={TextLink.variant.secondary}
          underline
        >
          Generate key pair for a new account
        </TextLink>
      </div>

      <Modal visible={activeModal !== null} onClose={closeModal}>
        {renderModalContent()}
      </Modal>
    </div>
  );
};

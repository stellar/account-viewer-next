import { Logo } from "@stellar/design-system";
import { ModalType, Wallets } from "types/types.d";

export const wallets: Wallets = {
  albedo: {
    title: "Connect with Albedo",
    logoSvg: Logo.Albedo,
    logoImgAltText: "Albedo logo",
    modalType: ModalType.SIGNIN_ALBEDO,
    infoText: "Albedo is a browser wallet.",
    infoLinkText: "Learn more",
    infoLink: "https://albedo.link",
  },
  freighter: {
    title: "Connect with Freighter",
    logoSvg: Logo.Freighter,
    logoImgAltText: "Freighter logo",
    modalType: ModalType.SIGNIN_FREIGHTER,
    infoText:
      "Freighter is a browser extension wallet. Available on Chrome and Firefox.",
    infoLinkText: "Download",
    infoLink: "https://freighter.app",
  },
  ledger: {
    title: "Connect with Ledger",
    logoSvg: Logo.Ledger,
    logoImgAltText: "Ledger logo",
    modalType: ModalType.SIGNIN_LEDGER,
    infoText: "Ledger is a Stellar-compatible hardware wallet.",
    infoLinkText: "Learn more",
    infoLink: "https://www.ledger.com",
  },
  trezor: {
    title: "Connect with Trezor",
    logoSvg: Logo.Trezor,
    logoImgAltText: "Trezor logo",
    modalType: ModalType.SIGNIN_TREZOR,
    infoText: "Trezor is a Stellar-compatible hardware wallet.",
    infoLinkText: "Learn more",
    infoLink: "https://trezor.io",
  },
};

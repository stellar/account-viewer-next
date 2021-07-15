import React from "react";
import { MemoType, MemoValue, Horizon, Transaction } from "stellar-sdk";
import { Types } from "@stellar/wallet-sdk";

declare global {
  interface Window {
    _env_: {
      AMPLITUDE_API_KEY: string;
    };
  }
}

export enum NetworkType {
  TESTNET = "testnet",
  PUBLIC = "public",
}

export enum ActionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export interface RejectMessage {
  errorString: string;
}

export enum NetworkCongestion {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum AuthType {
  ALBEDO = "ALBEDO",
  LEDGER = "LEDGER",
  FREIGHTER = "FREIGHTER",
  PRIVATE_KEY = "PRIVATE_KEY",
  TREZOR = "TREZOR",
}

export interface ModalPageProps {
  onClose?: () => void;
}

export interface ThemeProps {
  bodyBackground: string;
}

export interface Theme {
  [themeName: string]: ThemeProps;
}

export enum ModalType {
  SIGNIN_SECRET_KEY = "SIGNIN_SECRET_KEY",
  SIGNIN_TREZOR = "SIGNIN_TREZOR",
  SIGNIN_LEDGER = "SIGNIN_LEDGER",
  SIGNIN_FREIGHTER = "SIGNIN_FREIGHTER",
  SIGNIN_ALBEDO = "SIGNIN_ALBEDO",
  NEW_KEY_PAIR = "NEW_KEY_PAIR",
}

// Store
export interface AccountInitialState {
  data: Types.AccountDetails | null;
  isAuthenticated: boolean;
  isAccountWatcherStarted: boolean;
  isUnfunded: boolean;
  status: ActionStatus | undefined;
  errorString?: string;
}

interface FlaggedAccount {
  address: string;
  tags: string[];
}

export interface FlaggedAccounts {
  data: [FlaggedAccount];
  status: ActionStatus | undefined;
}

export interface MemoRequiredAccount {
  address: string;
  name: string;
  domain?: string;
}

export interface MemoRequiredAccountsResponse {
  [key: string]: MemoRequiredAccount;
}

export interface MemoRequiredAccountsInitialState {
  data: MemoRequiredAccountsResponse;
  status: ActionStatus | undefined;
}

export interface KeyStoreInitialState {
  keyStoreId: string;
  password: string;
  errorString?: string;
  custom?: {
    [key: string]: any;
  };
}

export interface SendTxInitialState {
  data: Horizon.TransactionResponse | null;
  status: ActionStatus | undefined;
  errorString?: string;
}

export interface SettingsInitialState {
  authType: AuthType | undefined;
  isTestnet: boolean;
}

export interface Setting {
  [key: string]: any;
}

export interface TxHistoryInitialState {
  data: Types.Payment[];
  hasMoreTxs?: boolean;
  isTxWatcherStarted: boolean;
  errorString?: string;
  status: ActionStatus | undefined;
}

export interface WalletInitialState {
  data: { publicKey: string } | null;
  status: ActionStatus | undefined;
  errorString?: string;
}

export interface Store {
  account: AccountInitialState;
  flaggedAccounts: FlaggedAccounts;
  keyStore: KeyStoreInitialState;
  memoRequiredAccounts: MemoRequiredAccountsInitialState;
  sendTx: SendTxInitialState;
  settings: SettingsInitialState;
  txHistory: TxHistoryInitialState;
  walletAlbedo: WalletInitialState;
  walletLedger: WalletInitialState;
  walletFreighter: WalletInitialState;
  walletTrezor: WalletInitialState;
}

export type StoreKey = keyof Store;

export interface WalletData {
  title: string;
  logoSvg: React.ReactNode;
  logoImgAltText: string;
  modalType: ModalType;
  infoText: React.ReactNode | string;
  infoLinkText: string;
  infoLink: string;
}

export interface Wallets {
  [key: string]: WalletData;
}

export interface PaymentFormData {
  toAccountId: string;
  federationAddress?: string;
  amount: string;
  memoType: MemoType;
  memoContent: MemoValue;
  isAccountFunded: boolean;
  isAccountUnsafe: boolean;
  tx: Transaction | undefined;
}

export interface AnyObject {
  [key: string]: any;
}

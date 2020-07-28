import StellarSdk, {
  Transaction,
  MemoType,
  MemoValue,
  Keypair,
} from "stellar-sdk";
// @ts-ignore
import { AuthType } from "constants/types.d";
import { PaymentTransactionParams } from "ducks/sendTransaction";
import { getNetworkConfig } from "helpers/getNetworkConfig";
import { trezorSignTransaction } from "helpers/wallet/trezorSignTransaction";
import { store } from "config/store";

const getSignature = (transaction: Transaction, authType: AuthType) => {
  switch (authType) {
    case AuthType.TREZOR:
      return trezorSignTransaction(transaction);
    default:
      throw new Error(`Sorry, we don’t support ${authType}.`);
  }
};

export const submitPaymentTransaction = async (
  params: PaymentTransactionParams,
  authType?: AuthType,
) => {
  const { settings } = store.getState();
  const server = new StellarSdk.Server(
    getNetworkConfig(settings.isTestnet).url,
  );

  let transaction = await buildPaymentTransaction(params);
  transaction = await signTransaction(transaction, params, authType);

  const result = await server.submitTransaction(transaction);
  return result;
};

export const signTransaction = async (
  transaction: Transaction,
  params: PaymentTransactionParams,
  authType?: AuthType,
) => {
  try {
    if (!authType) {
      throw new Error(`Bad authentication`);
    }

    if (authType === AuthType.PRIVATE_KEY) {
      const keypair = Keypair.fromSecret(params.secret);
      transaction.sign(keypair);
    } else {
      const signature = await getSignature(transaction, authType);

      transaction.addSignature(params.publicKey, signature);
    }
  } catch (err) {
    throw new Error(`Failed to sign transaction, error: ${err.toString()}`);
  }

  return transaction;
};

const createMemo = (memoType: MemoType, memoContent: MemoValue) => {
  switch (memoType) {
    case StellarSdk.MemoText:
      return StellarSdk.Memo.text(memoContent);
    case StellarSdk.MemoID:
      return StellarSdk.Memo.id(memoContent);
    case StellarSdk.MemoHash:
      return StellarSdk.Memo.hash(memoContent);
    case StellarSdk.MemoReturn:
      return StellarSdk.Memo.return(memoContent);
    case StellarSdk.MemoNone:
    default:
      return StellarSdk.Memo.none();
  }
};

export const buildPaymentTransaction = async (
  params: PaymentTransactionParams,
) => {
  let transaction;
  try {
    const {
      publicKey,
      amount,
      fee,
      toAccountId,
      memoContent,
      memoType,
    } = params;
    const { settings } = store.getState();
    const server = new StellarSdk.Server(
      getNetworkConfig(settings.isTestnet).url,
    );
    const sequence = (await server.loadAccount(publicKey)).sequence;
    const source = await new StellarSdk.Account(publicKey, sequence);

    transaction = new StellarSdk.TransactionBuilder(source, {
      fee,
      networkPassphrase: getNetworkConfig(settings.isTestnet).network,
      timebounds: await server.fetchTimebounds(100),
    }).addOperation(
      StellarSdk.Operation.payment({
        destination: toAccountId,
        asset: StellarSdk.Asset.native(),
        amount: amount.toString(),
      }),
    );

    if (memoType !== StellarSdk.MemoNone) {
      transaction = transaction.addMemo(createMemo(memoType, memoContent));
    }

    transaction = transaction.build();
  } catch (err) {
    throw new Error(`Failed to build transaction, error: ${err.toString()})}`);
  }
  return transaction;
};

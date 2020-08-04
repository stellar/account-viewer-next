import { KeyManager, KeyManagerPlugins, KeyType } from "@stellar/wallet-sdk";
import { Transaction } from "stellar-sdk";
import { getErrorString } from "helpers/getErrorString";
import { getNetworkConfig } from "helpers/getNetworkConfig";
import { store } from "config/store";

export interface CreateKeyManagerResponse {
  id: string;
  password: string;
  errorString?: string;
}

const createKeyManager = () => {
  const localKeyStore = new KeyManagerPlugins.LocalStorageKeyStore();
  localKeyStore.configure({ storage: localStorage });
  const { settings } = store.getState();

  const keyManager = new KeyManager({
    keyStore: localKeyStore,
    defaultNetworkPassphrase: getNetworkConfig(settings.isTestnet).network,
  });

  keyManager.registerEncrypter(KeyManagerPlugins.ScryptEncrypter);
  return keyManager;
};

export const storeKey = async ({
  publicKey,
  privateKey,
  keyType,
}: {
  publicKey: string;
  privateKey?: string;
  keyType: KeyType;
}) => {
  const keyManager = createKeyManager();
  const { settings } = store.getState();

  const result: CreateKeyManagerResponse = {
    id: "",
    password: "Stellar Development Foundation",
    errorString: undefined,
  };

  try {
    const metaData = await keyManager.storeKey({
      key: {
        type: keyType,
        publicKey,
        privateKey: privateKey || "",
        network: getNetworkConfig(settings.isTestnet).network,
      },
      password: result.password,
      encrypterName: KeyManagerPlugins.ScryptEncrypter.name,
    });

    result.id = metaData.id;
  } catch (error) {
    result.errorString = getErrorString(error);
    return result;
  }

  return result;
};

export const loadPrivateKey = async ({
  id,
  password,
}: {
  id: string;
  password: string;
}) => {
  const keyManager = createKeyManager();
  let result;
  try {
    result = await keyManager.loadKey(id, password);
  } catch (error) {
    return error;
  }
  return result;
};

export const signTransaction = ({
  id,
  password,
  transaction,
}: {
  id: string;
  password: string;
  transaction: Transaction;
}): Promise<Transaction> => {
  const keyManager = createKeyManager();

  return keyManager.signTransaction({
    id,
    password,
    transaction,
  });
};

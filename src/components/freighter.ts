import {
  requestAccess,
  signTransaction,
  setAllowed,
} from "@stellar/freighter-api";

async function checkConnection(): Promise<boolean | undefined> {
  const isAllowed = await setAllowed();
  if (isAllowed) {
    return true;
  }
}

const retrievePublicKey = async (): Promise<string> => {
  let publicKey = "";
  let error: any = "";
  try {
    publicKey = await requestAccess();
  } catch (e) {
    error = e;
  }
  if (error) {
    return error;
  }
  return publicKey;
};

const userSignTransaction = async (
  xdr: string,
  network: string,
  signWith: string
): Promise<string> => {
  let signedTransaction = "";
  let error: any = "";
  try {
    signedTransaction = await signTransaction(xdr, {
      network,
      accountToSign: signWith,
    });
  } catch (e) {
    error = e;
  }
  if (error) {
    return error;
  }
  return signedTransaction;
};

export { retrievePublicKey, checkConnection, userSignTransaction };

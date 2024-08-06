import "dotenv/config";
import {
  Contract,
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  nativeToScVal,
  Address,
} from "@stellar/stellar-sdk";
import { userSignTransaction } from "./freighter";
import { getPublicKey } from "@stellar/freighter-api";

const rpcUrl = "https://soroban-testnet.stellar.org";
const contractAddress =
  "CAAN5X32XWBIX3Q52BR4AJDVBAXPC5M3MVVPAVE5HVES2VWJBPO573L2";

const stringToSymbol = (value: string) => {
  return nativeToScVal(value, { type: "symbol" });
};

const accountToScVal = (account: string) => new Address(account).toScVal();

const params = {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
};

async function contractInt(
  caller: string,
  functName: string,
  values: any[] | null
): Promise<any> {
  const provider = new SorobanRpc.Server(rpcUrl, { allowHttp: true });
  const contract = new Contract(contractAddress);
  const sourceAccount = await provider.getAccount(caller);

  let buildTx;
  if (values == null) {
    buildTx = new TransactionBuilder(sourceAccount, params)
      .addOperation(contract.call(functName))
      .setTimeout(30)
      .build();
  } else {
    buildTx = new TransactionBuilder(sourceAccount, params)
      .addOperation(contract.call(functName, ...values))
      .setTimeout(30)
      .build();
  }

  let _buildTx = await provider.prepareTransaction(buildTx);
  let prepareTx = _buildTx.toXDR();
  let signedTx = await userSignTransaction(prepareTx, "TESTNET", caller);
  let tx = TransactionBuilder.fromXDR(signedTx, Networks.TESTNET);

  try {
    let sendTx = await provider.sendTransaction(tx).catch(function (err) {
      return err;
    });

    if (sendTx.errorResult) {
      throw new Error("Unable to submit transaction");
    }

    if (sendTx.status === "PENDING") {
      let txResponse = await provider.getTransaction(sendTx.hash);
      while (txResponse.status === "NOT_FOUND") {
        txResponse = await provider.getTransaction(sendTx.hash);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (txResponse.status === "SUCCESS") {
        let result = txResponse.returnValue;
        return result;
      }
    }
  } catch (err) {
    return err;
  }
}

async function fetchPoll(): Promise<string[]> {
  const caller = await getPublicKey();
  const result = await contractInt(caller, "view_poll", null);

  const no = result._value[0]._attributes.val._value.toString();
  const total = result._value[1]._attributes.val._value.toString();
  const yes = result._value[2]._attributes.val._value.toString();

  return [no, total, yes];
}

async function fetchVoter(): Promise<string[]> {
  const caller = await getPublicKey();
  const voter = accountToScVal(caller);
  const result = await contractInt(caller, "view_voter", [voter]);

  const selected = result._value[0]._attributes.val._value.toString();
  const time = result._value[1]._attributes.val._value.toString();
  const votes = result._value[2]._attributes.val._value.toString();

  return [selected, time, votes];
}

async function vote(value: string): Promise<any> {
  const caller = await getPublicKey();
  const selected = stringToSymbol(value);
  const voter = accountToScVal(caller);
  const values = [voter, selected];
  const result = await contractInt(caller, "record_votes", values);

  return result;
}

export { fetchPoll, fetchVoter, vote };

"use client";

import { useEffect, useState } from "react";
import {
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  Horizon,
  NotFoundError,
  BASE_FEE,
  Memo,
} from "stellar-sdk";
import Head from "next/head";
const testSecretId = "SBYUX4IXH7CPWY2QSCUDD4J7VVYS7BQZRFSDJJM6P6UQSEYYUYIJT56M";
const testReceiveId =
  "GDQZ4AYTN2EFZAKLKL2TGRZRS5DJ3AW7T5MY56VZUEGS2QI7KGQYHS5I";

function SendAndReceivePayment() {
  const [status, setStatus] = useState<string>("");
  const initialPaymentInfo = {
    sendSecretId: "",
    receiveId: "",
    amount: "0",
  };
  const [paymentInfo, setPaymentInfor] = useState<{
    sendSecretId: string;
    receiveId: string;
    amount: string;
  }>(initialPaymentInfo);

  const [isSending, setIsSending] = useState(false);
  const [sendUserInfo, setSendUserInfo] = useState("");
  console.log("sendUserInfo: ", sendUserInfo);
  useEffect(() => {
    if (paymentInfo.receiveId) {
      new Horizon.Server("https://horizon-testnet.stellar.org")
        .loadAccount(paymentInfo.receiveId)
        .then((res) => {
          console.log(res);
          setSendUserInfo(res.balances[0]?.balance);
        });
    }
  }, [paymentInfo.receiveId]);

  const createToken = async (info: {
    sendSecretId: string;
    receiveId: string;
    amount: string;
  }) => {
    setIsSending(true);
    const server = new Horizon.Server("https://horizon-testnet.stellar.org");
    const sourceKeys = Keypair.fromSecret(info.sendSecretId);
    const destinationId = info.receiveId;

    let transaction;

    server
      .loadAccount(destinationId)
      // If the account is not found, surface a nicer error message for logging.
      .catch(function (error) {
        if (error instanceof NotFoundError) {
          throw new Error("The destination account does not exist!");
        } else return error;
      })
      // If there was no error, load up-to-date information on your account.
      .then(function () {
        return server.loadAccount(sourceKeys.publicKey());
      })
      .then(function (sourceAccount) {
        // Start building the transaction.
        transaction = new TransactionBuilder(sourceAccount, {
          fee: BASE_FEE,
          networkPassphrase: Networks.TESTNET,
        })
          .addOperation(
            Operation.payment({
              destination: destinationId,
              // Because Stellar allows transaction in many currencies, you must
              // specify the asset type. The special "native" asset represents Lumens.
              asset: Asset.native(),
              amount: info.amount.toString(),
            })
          )
          // A memo allows you to add your own metadata to a transaction. It's
          // optional and does not affect how Stellar treats the transaction.
          .addMemo(Memo.text("Test Transaction"))
          // Wait a maximum of three minutes for the transaction
          .setTimeout(180)
          .build();
        // Sign the transaction to prove you are actually the person sending it.
        transaction.sign(sourceKeys);
        // And finally, send it off to Stellar!
        return server.submitTransaction(transaction);
      })
      .then(function (result) {
        setStatus("Send Payment successfully!");
        setPaymentInfor(initialPaymentInfo);
        setIsSending(false);
      })
      .catch(function (error) {
        console.error("Something went wrong!", error);
        // If the result is unknown (no response body, timeout etc.) we simply resubmit
        // already built transaction:
        // server.submitTransaction(transaction);
        setStatus("Error send payment. Check the console for details.");
        setIsSending(false);
      });
  };

  return (
    <div className="min-h-screen font-sans flex items-center justify-center bg-gray-100">
      <Head>
        <title>Demo Send and Receive Payment</title>
      </Head>
      <div className="bg-white p-6 rounded shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">
          Demo Send and Receive Payment
        </h1>
        <form
          className="flex flex-col gap-3 items-start w-full"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="secretId" className="block">
            Send Secret Id
          </label>
          <input
            className="border rounded-md p-1 text-xl"
            id="secretId"
            name="secretId"
            type="text"
            onChange={(e) =>
              setPaymentInfor({ ...paymentInfo, sendSecretId: e.target.value })
            }
            value={paymentInfo.sendSecretId}
          />

          <label htmlFor="receiveId" className="block">
            Receive Public Id
          </label>
          <input
            className="border rounded-md p-1 text-xl"
            id="receiveId"
            name="receiveId"
            type="text"
            onChange={(e) =>
              setPaymentInfor({ ...paymentInfo, receiveId: e.target.value })
            }
            value={paymentInfo.receiveId}
          />

          <label htmlFor="amount" className="block">
            Amount
          </label>
          <input
            className="border rounded-md p-1 text-xl"
            id="amount"
            name="amount"
            type="number"
            onChange={(e) =>
              setPaymentInfor({ ...paymentInfo, amount: e.target.value })
            }
            value={paymentInfo.amount}
          />
          <button
            disabled={isSending}
            type="submit"
            onClick={() => createToken(paymentInfo)}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200 mt-3"
          >
            {isSending ? "Sending..." : "Send Payment"}
          </button>
          {status && <p className="mt-4 text-red-500">{status}</p>}
        </form>
      </div>
    </div>
  );
}

export default SendAndReceivePayment;

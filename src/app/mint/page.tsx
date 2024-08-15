"use client";

import React from "react";
import MintToken from "../../components/mint-tokens";
import {
  BASE_FEE,
  Horizon,
  Keypair,
  Networks,
  NotFoundError,
  Operation,
  TransactionBuilder,
  StrKey,
  xdr,
  Address,
  nativeToScVal,
  SorobanRpc,
  Contract,
} from "stellar-sdk";
import { numberToI128 } from "../../components/helpers/soroban";

const testSecretId = "SBYUX4IXH7CPWY2QSCUDD4J7VVYS7BQZRFSDJJM6P6UQSEYYUYIJT56M";
const testReceiveId =
  "GBZV5RWHM2SXGJ7ACQDDCAYCW6MEHTWC4EDQC32I52HRLXMNB3QRIOBP";
const contractId = "CCQGVZ7VD3DOENH5G7YVTZVCA7HIO64JC7MKDZHNEHIUDQKEXE2ULIU5";

function MintPage() {
  const mintToken = async () => {
    // The source account will be used to sign and send the transaction.
    // GCWY3M4VRW4NXJRI7IVAU3CC7XOPN6PRBG6I5M7TAOQNKZXLT3KAH362
    const sourceKeypair = Keypair.fromSecret(testSecretId);

    // Configure SorobanClient to use the `soroban-rpc` instance of your
    // choosing.
    const server = new SorobanRpc.Server(
      "https://soroban-testnet.stellar.org:443"
    );

    // Here we will use a deployed instance of the `increment` example contract.
    const contractAddress =
      "CCTAMZGXBVCQJJCX64EVYTM6BKW5BXDI5PRCXTAYT6DVEDXKGS347HWU";
    const contract = new Contract(contractId);

    // Transactions require a valid sequence number (which varies from one
    // account to another). We fetch this sequence number from the RPC server.
    const sourceAccount = await server.getAccount(sourceKeypair.publicKey());

    // The transaction begins as pretty standard. The source account, minimum
    // fee, and network passphrase are provided.
    let builtTransaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      // The invocation of the `increment` function of our contract is added
      // to the transaction.
      .addOperation(
        Operation.invokeContractFunction({
          contract: contractId,
          function: "mint",
          args: [
            nativeToScVal(Address.fromString(sourceKeypair.publicKey())),
            xdr.ScVal.scvI128(
              new xdr.Int128Parts({
                hi: xdr.Int64.fromString("100"),
                lo: xdr.Uint64.fromString("100"),
              })
            ),
          ],
        })
      )
      // This transaction will be valid for the next 30 seconds
      .setTimeout(30)
      .build();

    console.log(`builtTransaction=${builtTransaction.toXDR()}`);

    // We use the RPC server to "prepare" the transaction. This simulating the
    // transaction, discovering the storage footprint, and updating the
    // transaction to include that footprint. If you know the footprint ahead of
    // time, you could manually use `addFootprint` and skip this step.
    let preparedTransaction = await server.prepareTransaction(builtTransaction);

    // Sign the transaction with the source account's keypair.
    preparedTransaction.sign(sourceKeypair);

    // Let's see the base64-encoded XDR of the transaction we just built.
    console.log(
      `Signed prepared transaction XDR: ${preparedTransaction
        .toEnvelope()
        .toXDR("base64")}`
    );

    // Submit the transaction to the Soroban-RPC server. The RPC server will
    // then submit the transaction into the network for us. Then we will have to
    // wait, polling `getTransaction` until the transaction completes.
    try {
      let sendResponse = await server.sendTransaction(preparedTransaction);
      console.log(`Sent transaction: ${JSON.stringify(sendResponse)}`);

      if (sendResponse.status === "PENDING") {
        let getResponse = await server.getTransaction(sendResponse.hash);
        // Poll `getTransaction` until the status is not "NOT_FOUND"
        while (getResponse.status === "NOT_FOUND") {
          console.log("Waiting for transaction confirmation...");
          // See if the transaction is complete
          getResponse = await server.getTransaction(sendResponse.hash);
          // Wait one second
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        console.log(`getTransaction response: ${JSON.stringify(getResponse)}`);

        if (getResponse.status === "SUCCESS") {
          // Make sure the transaction's resultMetaXDR is not empty
          if (!getResponse.resultMetaXdr) {
            throw "Empty resultMetaXDR in getTransaction response";
          }
          // Find the return value from the contract and return it
          let transactionMeta = getResponse.resultMetaXdr;
          let returnValue = transactionMeta.v3().sorobanMeta()?.returnValue();
          console.log(`Transaction result: ${returnValue?.value()}`);
        } else {
          throw `Transaction failed: ${getResponse.resultXdr}`;
        }
      } else {
        throw sendResponse.errorResult;
      }
    } catch (err) {
      // Catch and report any errors we've thrown
      console.log("Sending transaction failed");
      console.log(JSON.stringify(err));
    }
  };
  // const mintToken = () => {
  //   const server = new Horizon.Server("https://horizon-testnet.stellar.org");
  //   const sourceKeys = Keypair.fromSecret(testSecretId);

  //   server
  //     .loadAccount("GBZV5RWHM2SXGJ7ACQDDCAYCW6MEHTWC4EDQC32I52HRLXMNB3QRIOBP")
  //     // If the account is not found, surface a nicer error message for logging.
  //     .catch(function (error) {
  //       if (error instanceof NotFoundError) {
  //         throw new Error("The destination account does not exist!");
  //       } else return error;
  //     })
  //     // If there was no error, load up-to-date information on your account.
  //     .then(function () {
  //       return server.loadAccount(sourceKeys.publicKey());
  //     })
  //     .then(function (sourceAccount) {
  //       // Start building the transaction.
  //       const transaction = new TransactionBuilder(sourceAccount, {
  //         fee: BASE_FEE,
  //         networkPassphrase: Networks.TESTNET,
  //       })
  //         .addOperation(
  //           Operation.invokeContractFunction({
  //             contract: contractId,
  //             function: "mint",
  //             args: [
  //               nativeToScVal(Address.fromString(testReceiveId)),
  //               xdr.ScVal.scvI64(xdr.Int64.fromString("100")),
  //             ],
  //           })
  //         )
  //         .setTimeout(180)
  //         .build();
  //       console.log("transaction: ", transaction);
  //       // Sign the transaction to prove you are actually the person sending it.
  //       transaction.sign(sourceKeys);
  //       // And finally, send it off to Stellar!
  //       return server.submitTransaction(transaction);
  //     })
  //     .then(function (result) {
  //       console.log("result: ", result);
  //       return result;
  //     })
  //     .catch(function (error) {
  //       console.error("Something went wrong!", error);
  //     });
  // };
  return (
    <div id="mintPage">
      {/* <button onClick={mintToken}>mint</button> */}
      <MintToken />
    </div>
  );
}

export default MintPage;

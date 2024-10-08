"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import BigNumber from "bignumber.js";
import {
  Card,
  Layout,
  Notification,
  Profile,
  Loader,
  Pagination,
} from "@stellar/design-system";
import {
  StellarWalletsKit,
  WalletNetwork,
  WalletType,
  ISupportedWallet,
} from "@sekmet/stellar-wallets-kit";

import { stroopToXlm } from "../helpers/format";
import { TESTNET_DETAILS } from "../helpers/network";
import { ERRORS } from "../helpers/error";
import {
  getEstimatedFee,
  getTxBuilder,
  BASE_FEE,
  XLM_DECIMALS,
  getTokenDecimals,
  getTokenSymbol,
  getServer,
  submitTx,
} from "../helpers/soroban";

import { TxResult } from "./tx-result";
import { SubmitToken } from "./token-submit";
import { ConfirmMintTx } from "./token-confirmation";
import { TokenTransaction } from "./token-transaction";
import { TokenQuantity } from "./token-quantity";
import { TokenInput } from "./token-input";
import { TokenDest } from "./token-destination";
import { ConnectWallet } from "./connect-wallet";
import "@stellar/design-system/build/styles.min.css";
import "./index.scss";

type StepCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface MintTokenProps {
  hasHeader?: boolean;
}

function MintToken(props: MintTokenProps) {
  // This is only needed when this component is consumed by other components that display a different header
  const hasHeader = props.hasHeader === undefined ? true : props.hasHeader;

  // Default to Testnet network
  const [selectedNetwork] = useState(TESTNET_DETAILS);

  // Initial state, empty states for token/transaction details
  const [activePubKey, setActivePubKey] = useState(null as string | null);
  const [stepCount, setStepCount] = useState(1 as StepCount);
  const [connectionError, setConnectionError] = useState(null as string | null);

  const [fee, setFee] = useState(BASE_FEE);
  const [memo, setMemo] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [tokenDecimals, setTokenDecimals] = useState(XLM_DECIMALS);
  const [tokenDestination, setTokenDestination] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [txResultXDR, setTxResultXDR] = useState("");
  const [signedXdr, setSignedXdr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2 basic loading states for now
  const [isLoadingTokenDetails, setIsLoadingTokenDetails] =
    useState<boolean>(false);
  const [isGettingFee, setIsGettingFee] = useState(false);

  // Setup swc, user will set the desired wallet on connect
  const [SWKKit] = useState(
    new StellarWalletsKit({
      network: selectedNetwork.networkPassphrase as WalletNetwork,
      selectedWallet: WalletType.FREIGHTER,
    })
  );

  // Whenever the selected network changes, set the network on swc
  useEffect(() => {
    SWKKit.setNetwork(selectedNetwork.networkPassphrase as WalletNetwork);
  }, [selectedNetwork.networkPassphrase, SWKKit]);

  // with a user provided token ID, fetch token details
  async function setToken(id: string) {
    setIsLoadingTokenDetails(true);
    setTokenId(id);

    // get an instance of a Soroban RPC server for the selected network
    const server = getServer(selectedNetwork);

    try {
      // Right now, Soroban only supports operation per transaction
      // so we need to get a transaction builder for every operation we want to call.
      // In the future, we will be able to use more than 1 operation in a single transaction.

      const txBuilderAdmin = await getTxBuilder(
        activePubKey!,
        BASE_FEE,
        server,
        selectedNetwork.networkPassphrase
      );

      // Get the symbol for the set token ID
      // https://github.com/stellar/soroban-examples/blob/main/token/src/contract.rs#L47
      const symbol = await getTokenSymbol(id, txBuilderAdmin, server);
      setTokenSymbol(symbol);

      const txBuilderDecimals = await getTxBuilder(
        activePubKey!,
        BASE_FEE,
        server,
        selectedNetwork.networkPassphrase
      );

      // Get the number of decimals set for the selected token, so that we can properly display
      // a formatted value.
      // https://github.com/stellar/soroban-examples/blob/main/token/src/contract.rs#L43
      const decimals = await getTokenDecimals(id, txBuilderDecimals, server);
      setTokenDecimals(decimals);
      setIsLoadingTokenDetails(false);

      return true;
    } catch (error) {
      console.log(error);
      setConnectionError("Unable to fetch token details.");
      setIsLoadingTokenDetails(false);

      return false;
    }
  }

  const getFee = async () => {
    setIsGettingFee(true);
    const server = getServer(selectedNetwork);

    try {
      const builder = await getTxBuilder(
        activePubKey!,
        fee,
        server,
        selectedNetwork.networkPassphrase
      );

      const estimatedFee = await getEstimatedFee(
        tokenId,
        new BigNumber(quantity).toNumber(),
        tokenDestination,
        memo,
        builder,
        server
      );
      setFee(stroopToXlm(estimatedFee).toString());
      setIsGettingFee(false);
    } catch (error) {
      // defaults to hardcoded base fee if this fails
      console.log(error);
      setIsGettingFee(false);
    }
  };

  // This uses the StepCount tro render to currently active step in the payment flow
  const renderStep = (step: StepCount) => {
    switch (step) {
      case 8: {
        const onClick = () => setStepCount(1);
        return <TxResult onClick={onClick} resultXDR={txResultXDR} />;
      }
      case 7: {
        // Uses state saved from previous steps in order to submit a transaction to the network
        const submit = async () => {
          const server = getServer(selectedNetwork);

          setIsSubmitting(true);

          try {
            const result = await submitTx(
              signedXdr,
              selectedNetwork.networkPassphrase,
              server
            );

            setTxResultXDR(result);
            setIsSubmitting(false);

            setStepCount((stepCount + 1) as StepCount);
          } catch (error) {
            console.log(error);
            setIsSubmitting(false);
            setConnectionError(ERRORS.UNABLE_TO_SUBMIT_TX);
          }
        };
        return (
          <SubmitToken
            network={selectedNetwork.network}
            destination={tokenDestination}
            quantity={quantity}
            tokenSymbol={tokenSymbol}
            fee={fee}
            signedXdr={signedXdr}
            isSubmitting={isSubmitting}
            memo={memo}
            onClick={submit}
          />
        );
      }
      case 6: {
        const setSignedTx = (xdr: string) => {
          setSignedXdr(xdr);
          setStepCount((stepCount + 1) as StepCount);
        };
        return (
          <ConfirmMintTx
            tokenId={tokenId}
            pubKey={activePubKey!}
            tokenSymbol={tokenSymbol}
            onTxSign={setSignedTx}
            destination={tokenDestination}
            quantity={quantity}
            fee={fee}
            memo={memo}
            networkDetails={selectedNetwork}
            tokenDecimals={tokenDecimals}
            kit={SWKKit}
            setError={setConnectionError}
          />
        );
      }
      case 5: {
        const onClick = () => setStepCount((stepCount + 1) as StepCount);
        return (
          <TokenTransaction
            fee={fee}
            memo={memo}
            onClick={onClick}
            setFee={setFee}
            setMemo={setMemo}
          />
        );
      }
      case 4: {
        const onClick = async () => {
          // set estimated fee for next step
          await getFee();
          setStepCount((stepCount + 1) as StepCount);
        };

        if (isGettingFee) {
          return (
            <div className="loading">
              <Loader />
            </div>
          );
        }
        return (
          <TokenQuantity
            quantity={quantity}
            setQuantity={setQuantity}
            onClick={onClick}
            tokenSymbol={tokenSymbol}
          />
        );
      }
      case 3: {
        if (isLoadingTokenDetails) {
          return (
            <div className="loading">
              <Loader />
            </div>
          );
        }
        const onClick = async (value: string) => {
          const success = await setToken(value);

          if (success) {
            setStepCount((stepCount + 1) as StepCount);
          }
        };
        return <TokenInput onClick={onClick} />;
      }
      case 2: {
        const onClick = () => setStepCount((stepCount + 1) as StepCount);
        return (
          <TokenDest
            onClick={onClick}
            setDestination={setTokenDestination}
            destination={tokenDestination}
          />
        );
      }
      case 1:
      default: {
        const onClick = async () => {
          setConnectionError(null);

          // See https://github.com/Creit-Tech/Stellar-Wallets-Kit/tree/main for more options
          if (!activePubKey) {
            await SWKKit.openModal({
              allowedWallets: [
                WalletType.ALBEDO,
                WalletType.FREIGHTER,
                WalletType.XBULL,
              ],
              onWalletSelected: async (option: ISupportedWallet) => {
                try {
                  // Set selected wallet,  network, and public key
                  SWKKit.setWallet(option.type);
                  const publicKey = await SWKKit.getPublicKey();

                  await SWKKit.setNetwork(WalletNetwork.TESTNET);
                  setActivePubKey(publicKey);
                } catch (error) {
                  console.log(error);
                  setConnectionError(ERRORS.WALLET_CONNECTION_REJECTED);
                }
              },
            });
          } else {
            setStepCount((stepCount + 1) as StepCount);
          }
        };
        return (
          <ConnectWallet
            selectedNetwork={selectedNetwork.network}
            pubKey={activePubKey}
            onClick={onClick}
          />
        );
      }
    }
  };

  return (
    <>
      {hasHeader && (
        <Layout.Header hasThemeSwitch projectId="soroban-react-mint-token" />
      )}
      <div className="Layout__inset account-badge-row">
        {activePubKey !== null && (
          <Profile isShort publicAddress={activePubKey} size="sm" />
        )}
      </div>
      <div className="Layout__inset layout">
        {stepCount === 3 && (
          <div className="admin-banner-container">
            <Notification
              title="Account must be an admin of the token"
              variant="primary"
            />
          </div>
        )}
        <div className="mint-token">
          <Card variant="primary">
            <div className="step-count dark:text-white">
              step {stepCount} of 8
            </div>
            {renderStep(stepCount)}
          </Card>
        </div>
        {connectionError !== null &&
          createPortal(
            <div className="notification-container">
              <Notification title={connectionError!} variant="error" />
            </div>,
            document.getElementById("mintPage")!
          )}
      </div>
    </>
  );
}

export default MintToken;

"use client";
import React, { useEffect, useState } from "react";
import {
  isAllowed,
  setAllowed,
  getUserInfo,
  requestAccess,
} from "@stellar/freighter-api";

function StellarPage() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    const checkIsAllowed = async () => {
      if (await isAllowed()) {
        const pk = await getPk();
        if (pk) {
          setPublicKey(pk);
        } else {
          setError("Freighter is locked. Sign in & refresh the page.");
        }
      }
    };

    checkIsAllowed();
  }, [publicKey]);

  const getPk = async (): Promise<string> => {
    const { publicKey } = await getUserInfo();
    return publicKey;
  };

  const handleButtonClick = async () => {
    setIsButtonDisabled(true);
    await setAllowed();
    const pk = await getPk();
    if (pk) {
      setPublicKey(pk);
    } else {
      const instancePk = await requestAccess();
      setPublicKey(instancePk);
      setError("");
    }
  };

  return (
    <div
      id="freighter-wrap"
      className="wrap text-center font-serif my-20"
      aria-live="polite"
    >
      <div
        className="ellipsis mx-auto text-ellipsis overflow-hidden text-center whitespace-nowrap"
        title={publicKey ?? ""}
      >
        <div className="flex flex-col">
          {publicKey ? (
            `Signed in as ${publicKey}`
          ) : (
            <button
              data-connect
              aria-controls="freighter-wrap"
              onClick={handleButtonClick}
              disabled={isButtonDisabled}
              className="border w-fit mx-auto px-4 py-1 rounded-md"
            >
              Connect
            </button>
          )}
          <p>{error}</p>
        </div>
      </div>
    </div>
  );
}

export default StellarPage;

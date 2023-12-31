import { Button } from "antd";
import React, { useState } from "react";
import { ethers } from "ethers";
import { useBalance, useGasPrice } from "eth-hooks";

import { getRPCPollTime, Transactor, BuildbearTransactor } from "../helpers";

import { bbNode } from "../constants";

function FaucetHint({ localProvider, targetNetwork, address }) {
  const [faucetClicked, setFaucetClicked] = useState(false);

  const localProviderPollingTime = getRPCPollTime(localProvider);

  // fetch local balance
  const yourLocalBalance = useBalance(localProvider, address, localProviderPollingTime);

  // get gas Price from network
  const gasPrice = useGasPrice(targetNetwork, "fast", localProviderPollingTime);

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice);

  let faucetHint = "";

  if (
    !faucetClicked &&
    localProvider &&
    localProvider._network &&
    (localProvider._network.chainId === 31337 || (bbNode && localProvider._network.chainId === bbNode.chainId)) &&
    yourLocalBalance &&
    ethers.utils.formatEther(yourLocalBalance) <= 0
  ) {
    faucetHint = (
      <div style={{ position: "absolute", right: 65, top: 65 }}>
        <Button
          type="primary"
          onClick={() => {
            if (localProvider._network.chainId === bbNode.chainId)
              BuildbearTransactor({
                to: address,
                value: "1",
              });
            else
              faucetTx({
                to: address,
                value: ethers.utils.parseEther("0.01"),
              });
            setFaucetClicked(true);
          }}
        >
          💰 Grab funds from the faucet ⛽️
        </Button>
      </div>
    );
  }

  return faucetHint;
}

export default FaucetHint;

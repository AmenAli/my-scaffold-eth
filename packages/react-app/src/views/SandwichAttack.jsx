import { Button, Divider, Input, Select, notification } from "antd";
import React, { useEffect, useState } from "react";
import { ethers, utils } from "ethers";
import ERC20Artifact from "@openzeppelin/contracts/build/contracts/IERC20.json";
import { Address, ERC20Balance, Transactions } from "../components";
import { BASE_URL, bbSupportedERC20Tokens, bbNode } from "../constants";

export default function SandwichAttack({
  purpose,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const [fromToken, setFromToken] = useState();
  const [toToken, setToToken] = useState();
  const [value, setValue] = useState("");
  const [isTokenApproved, setIsTokenApproved] = useState(false);
  const isBuildbearNet = localProvider && localProvider.connection.url.startsWith(`https://rpc.${BASE_URL}`);
  const erc20ABI = ERC20Artifact.abi;

  const erc20Tokens = bbNode ? bbSupportedERC20Tokens[bbNode.forkingChainId] : {};
  let erc20Options = Object.keys(erc20Tokens).map(token => {
    return {
      value: erc20Tokens[token].address,
      label: token,
      decimals: erc20Tokens[token].decimals,
    };
  });

  async function approveToken() {
    if (fromToken && fromToken.address) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const ERC20Contract = new ethers.Contract(fromToken.address, erc20ABI, signer);
      const allowance = await ERC20Contract.allowance(await signer.getAddress(), writeContracts.TokenSwap.address);

      try {
        if (utils.parseUnits(value, fromToken.decimals).gt(allowance)) {
          const approveTx = await ERC20Contract.approve(writeContracts.TokenSwap.address, ethers.constants.MaxUint256);
          await approveTx.wait();
          setIsTokenApproved(true);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  useEffect(() => {
    (async function () {
      if (fromToken && fromToken.address) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const ERC20Contract = new ethers.Contract(fromToken.address, erc20ABI, signer);
        const allowance = await ERC20Contract.allowance(await signer.getAddress(), writeContracts.TokenSwap.address);

        try {
          if (value && utils.parseUnits(value, fromToken.decimals).lte(allowance)) {
            setIsTokenApproved(true);
          } else {
            setIsTokenApproved(false);
          }
        } catch (err) {
          setIsTokenApproved(false);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromToken, value]);

  function tokenArrRemove(arr, value) {
    return arr.filter(function (ele) {
      return ele.label !== value;
    });
  }

  return (
    <div style={{ paddingBottom: 256 }}>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div
        style={{
          border: "1px solid #cccccc",
          padding: 16,
          width: 400,
          margin: "auto",
          marginTop: 64,
          paddingBottom: 30,
        }}
      >
        <h2>SandwichAttack:</h2>
        <h4>Executing a SandwichAttack on UniswapV2.</h4>
        <Divider />
        <div style={{ margin: 8 }}>
          <Select
            style={{ width: "100%" }}
            placeholder="Swap From..."
            onChange={(value, data) => {
              setFromToken({ address: value, decimals: data.decimals, symbol: data.label });
            }}
            options={toToken ? tokenArrRemove(erc20Options, toToken.symbol) : erc20Options}
          />
          <Select
            style={{ width: "100%" }}
            placeholder="Swap To..."
            onChange={(value, data) => setToToken({ address: value, decimals: data.decimals, symbol: data.label })}
            options={fromToken ? tokenArrRemove(erc20Options, fromToken.symbol) : erc20Options}
          />

          <Input
            placeholder="Value"
            style={{ textAlign: "center" }}
            onChange={e => {
              setValue(e.target.value);
            }}
          />
          <br />
          <br />
          <h3>Front-Run Transaction</h3>
          <Button
            style={{ marginTop: 8 }}
            disabled={!(fromToken && toToken && value)}
            onClick={async () => {
              const result = tx(
                writeContracts.SandwichAttack.frontrun(
                  fromToken.address,
                  toToken.address,
                  utils.parseUnits(value, fromToken.decimals),
                ),
                update => {
                  console.log("📡 Transaction Update:", update);
                  if (update && (update.status === "confirmed" || update.status === 1)) {
                    console.log(" 🍾 Transaction " + update.hash + " finished!");
                    console.log(
                      " ⛽️ " +
                        update.gasUsed +
                        "/" +
                        (update.gasLimit || update.gas) +
                        " @ " +
                        parseFloat(update.gasPrice) / 1000000000 +
                        " gwei",
                    );
                  }
                },
              );
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Execute Front-Run Transaction
          </Button>

          <br />
          <br />
          <h3>User TokenSwap Transaction</h3>
          <Button style={{ marginTop: 8 }} onClick={approveToken} disabled={!(fromToken && value)}>
            {isTokenApproved ? "Approved ✅" : "Approve token"}
          </Button>
          <Button
            style={{ marginTop: 8 }}
            disabled={!(fromToken && toToken && value)}
            onClick={async () => {
              if (!isTokenApproved) {
                notification.error({
                  message: "Swap Error",
                  description: "You need to approve token first",
                });

                return;
              }

              const result = tx(
                writeContracts.TokenSwap.swap(
                  fromToken.address,
                  toToken.address,
                  utils.parseUnits(value, fromToken.decimals),
                ),
                update => {
                  console.log("📡 Transaction Update:", update);
                  if (update && (update.status === "confirmed" || update.status === 1)) {
                    console.log(" 🍾 Transaction " + update.hash + " finished!");
                    console.log(
                      " ⛽️ " +
                        update.gasUsed +
                        "/" +
                        (update.gasLimit || update.gas) +
                        " @ " +
                        parseFloat(update.gasPrice) / 1000000000 +
                        " gwei",
                    );
                  }
                },
              );
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Swap!
          </Button>
          <br />
          <br />
          <h3>Back-Run Transaction</h3>
          <Button
            style={{ marginTop: 8 }}
            disabled={!(fromToken && toToken && value)}
            onClick={async () => {
              const result = tx(writeContracts.SandwichAttack.backrun(), update => {
                console.log("📡 Transaction Update:", update);
                if (update && (update.status === "confirmed" || update.status === 1)) {
                  console.log(" 🍾 Transaction " + update.hash + " finished!");
                  console.log(
                    " ⛽️ " +
                      update.gasUsed +
                      "/" +
                      (update.gasLimit || update.gas) +
                      " @ " +
                      parseFloat(update.gasPrice) / 1000000000 +
                      " gwei",
                  );
                }
              });
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Execute Back-Run Transaction
          </Button>
        </div>
        <Divider />
        <h3 style={{ margin: 8 }}>
          How{" "}
          <span className="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
            SandwichAttack.sol
          </span>{" "}
          works
        </h3>
        <div style={{ margin: 8 }}>
          By using the{" "}
          <span className="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
            frontrun()
          </span>{" "}
          function, we initiate a token swap that modifies the token prices within the the{" "}
          <span className="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
            Uniswap V2 pool
          </span>
          and Subsequently, we utilize the
          <span className="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
            backrun()
          </span>
          function to execute another token swap once the user has Swaped Tokens.
        </div>
        <Divider />
        <h3 style={{ margin: 8 }}>Performing a Sandwich Attack: </h3>
        <div style={{ margin: 8 }}>
          In a sandwich attack scenario, the attacker closely monitors the mempool, which is a collection of pending
          transactions, in search of a specific target transaction that can be exploited. Once the target transaction is
          identified, the attacker submits two transactions – one preceding and one succeeding the target transaction –
          effectively enclosing it, much like the slices of bread in a sandwich.
          <br />
          <br />
          To gain a clear understanding of this process, we will execute three key transactions: the frontrun
          transaction, the User transaction, and the backrun transaction.
          <br />
          <br />
          1. In the frontrun transaction, we swap the token the user intends to exchange, thereby manipulating its
          price.
          <br />
          <br />
          2. In the User transaction, given that we have previously executed the frontrun, the user receives a lower
          quantity of tokens due to the altered price.
          <br />
          <br />
          3. In the backrun transaction, we execute a reverse swap of the tokens, aiming to generate profits from the
          price fluctuation.
        </div>
        <Divider />
        <h3 style={{ margin: 8 }}>Your ERC20 Token Balances</h3>
        <div style={{ margin: 8 }}>
          {erc20Options.map(token => (
            <div style={{ margin: 2, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {token.label}
              {"  "}
              <ERC20Balance tokenAddress={token.value} decimals={token.decimals} size={16} />
            </div>
          ))}
        </div>
        <Divider />
        SandwichAttack Contract Address:
        <Address
          address={readContracts && readContracts.SandwichAttack ? readContracts.SandwichAttack.address : null}
          ensProvider={mainnetProvider}
          blockExplorer={isBuildbearNet ? `https://explorer.${BASE_URL}/${bbNode.nodeId}/` : undefined}
          fontSize={16}
        />
        <br />
        UniSwapV2 Router Contract Address:
        <Address
          address={"0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"}
          ensProvider={mainnetProvider}
          blockExplorer={isBuildbearNet ? `https://explorer.${BASE_URL}/${bbNode.nodeId}/` : undefined}
          fontSize={16}
        />
      </div>

      {isBuildbearNet ? <Transactions /> : null}
    </div>
  );
}

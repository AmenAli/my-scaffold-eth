import { Button, Divider, Input, Select, notification } from "antd";
import React, { useEffect, useState } from "react";
import { ethers, utils } from "ethers";
import ERC20Artifact from "@openzeppelin/contracts/build/contracts/ERC20.json";
import { Address, ERC20Balance, Transactions } from "../components";
import { BASE_URL, bbSupportedERC20Tokens, bbNode } from "../constants";

export default function UniSwap({
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
  const [Token1, setToken1] = useState();
  const [Token0, setToken0] = useState();
  const [name, setName] = useState();
  const [symbol, setSymbol] = useState();
  const [address1, setaddress1] = useState("");
  const [pooladdress, setPooladdress] = useState();
  const [intilize_amount, setIntilize_amount] = useState();
  const [Liquidity_amount, setLiquidity_amount] = useState();
  const [showpooladdress, setShowpooladdress] = useState();
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [isTokenApproved, setIsTokenApproved] = useState(false);
  const [isTokenApproved1, setIsTokenApproved1] = useState(false);
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
    if (Token0 && Token1) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const ERC20Contract = new ethers.Contract(Token0, erc20ABI, signer);
      const allowance = await ERC20Contract.allowance(await signer.getAddress(), writeContracts.UniswapPool.address);
      const decimal0 = await ERC20Contract.decimals();

      try {
        if (utils.parseUnits(intilize_amount, decimal0).gt(allowance)) {
          const approveTx = await ERC20Contract.approve(
            writeContracts.UniswapPool.address,
            ethers.constants.MaxUint256,
          );
          await approveTx.wait();
        }
      } catch (err) {
        console.log(err);
      }
      const ERC20Contract2 = new ethers.Contract(Token1, erc20ABI, signer);
      const allowance2 = await ERC20Contract2.allowance(await signer.getAddress(), writeContracts.UniswapPool.address);
      const decimal1 = await ERC20Contract2.decimals();
      try {
        if (utils.parseUnits(intilize_amount, decimal1).gt(allowance2)) {
          const approveTx1 = await ERC20Contract2.approve(
            writeContracts.UniswapPool.address,
            ethers.constants.MaxUint256,
          );
          await approveTx1.wait();
          setIsTokenApproved(true);
        } else {
          setIsTokenApproved(true);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async function approveToken1() {
    if (Token0 && Token1) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const ERC20Contract = new ethers.Contract(Token0, erc20ABI, signer);
      const allowance = await ERC20Contract.allowance(await signer.getAddress(), writeContracts.UniswapPool.address);
      const decimal0 = await ERC20Contract.decimals();

      try {
        if (utils.parseUnits(Liquidity_amount, decimal0).gt(allowance)) {
          const approveTx = await ERC20Contract.approve(
            writeContracts.UniswapPool.address,
            ethers.constants.MaxUint256,
          );
          await approveTx.wait();
        }
      } catch (err) {
        console.log(err);
      }
      const ERC20Contract2 = new ethers.Contract(Token1, erc20ABI, signer);
      const allowance2 = await ERC20Contract2.allowance(await signer.getAddress(), writeContracts.UniswapPool.address);
      const decimal1 = await ERC20Contract2.decimals();
      try {
        if (utils.parseUnits(Liquidity_amount, decimal1).gt(allowance2)) {
          const approveTx1 = await ERC20Contract2.approve(
            writeContracts.UniswapPool.address,
            ethers.constants.MaxUint256,
          );
          await approveTx1.wait();
          setIsTokenApproved1(true);
        } else {
          setIsTokenApproved1(true);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

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
        <h2>Create pools on UniSwapV3 </h2>
        <Divider />
        <h3>Create a ERC20 Token</h3>
        <Input
          placeholder="Token name"
          style={{ textAlign: "center" }}
          onChange={e => {
            setName(e.target.value);
          }}
        />
        <Input
          placeholder="Token Symbol"
          style={{ textAlign: "center" }}
          onChange={e => {
            setSymbol(e.target.value);
          }}
        />
        <Button
          style={{ marginTop: 8 }}
          disabled={!(name && symbol)}
          onClick={async () => {
            const tr = await writeContracts.TokenFactory.CreateToken(name, symbol);
            tr.wait();
            const tt = await readContracts.TokenFactory.getToken();
            const lengt = tt.length;
            setaddress1(tt[lengt - 1]);
            setShow(true);
          }}
        >
          Create ERC20 Token
        </Button>
        <br />
        {show ? "Token Address" : ""}
        <br />
        {show ? address1 : ""}
        <br />
        <br />
        <h4>Select token to Create Pool</h4>
        <div style={{ margin: 8 }}>
          <Input
            placeholder="Token0"
            style={{ textAlign: "center" }}
            onChange={e => {
              setToken0(e.target.value);
            }}
          />
          <Select
            style={{ width: "100%" }}
            placeholder="Token1"
            onChange={(value, data) => {
              setToken1(value);
            }}
            options={Token1 ? tokenArrRemove(erc20Options, Token1.symbol) : erc20Options}
          />
          <Button
            style={{ marginTop: 8 }}
            disabled={!(Token0 && Token1)}
            onClick={async () => {
              const tx = await writeContracts.UniswapPool.CreatePool(Token0, Token1);
              tx.wait();
              const tt = await readContracts.UniswapPool.getPools();
              const lengt = tt.length;
              setPooladdress(tt[lengt - 1]);
              setShowpooladdress(true);
            }}
          >
            Create pool
          </Button>
          <br />
          {showpooladdress ? "Pool Address" : ""}
          <br />
          {showpooladdress ? pooladdress : ""}
          <br />

          <br />
          <h4>Intilize pool</h4>
          <div style={{ margin: 8 }}></div>
          <Input
            placeholder="Token amount"
            style={{ textAlign: "center" }}
            onChange={e => {
              setIntilize_amount(e.target.value);
              setIsTokenApproved(false);
            }}
          />
          <Button style={{ marginTop: 8 }} onClick={approveToken} disabled={!(Token0 && Token1 && pooladdress)}>
            {isTokenApproved ? "Approved ✅" : "Approve token"}
          </Button>
          <Button
            style={{ marginTop: 8 }}
            disabled={!isTokenApproved}
            onClick={async () => {
              writeContracts.UniswapPool.initializePool(pooladdress, intilize_amount, intilize_amount);
            }}
          >
            Intilize pool
          </Button>
          <br />
          <br />
          <h4>Add Liquidity to pool</h4>

          <Input
            placeholder="Token amount"
            style={{ textAlign: "center" }}
            onChange={e => {
              setLiquidity_amount(e.target.value);
              setIsTokenApproved1(false);
            }}
          />
          <Button style={{ marginTop: 8 }} onClick={approveToken1} disabled={!(Token0 && Token1 && pooladdress)}>
            {isTokenApproved1 ? "Approved ✅" : "Approve token"}
          </Button>
          <Button
            style={{ marginTop: 8 }}
            disabled={!isTokenApproved1}
            onClick={async () => {
              writeContracts.UniswapPool.increase_liquidity(pooladdress, Liquidity_amount, Liquidity_amount);
            }}
          >
            Add Liquidity
          </Button>
          <div style={{ margin: 8 }}></div>
        </div>
        <Divider />
        UniSwapPool Contract Address:
        <Address
          address={readContracts && readContracts.UniswapPool ? readContracts.UniswapPool.address : null}
          ensProvider={mainnetProvider}
          blockExplorer={isBuildbearNet ? `https://explorer.${BASE_URL}/${bbNode.nodeId}/` : undefined}
          fontSize={16}
        />
      </div>
      <h3 style={{ margin: 8, fontSize: 20, fontWeight: 600 }}>How Lending works?</h3>
      <div style={{ margin: 8 }}>
        Entire logic of the Creating pool is in
        <span className="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
          UniSwapPool.sol:
        </span>{" "}
        Smart contract is present in
        <span className="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
          packages/hardhat/contracts
        </span>{" "}
        <br />
        <br />
        <span className="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
          CreatePool():
        </span>{" "}
        This function allows users to Create new pools.
        <br />
        <br />
        <span className="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
          initializePool():
        </span>{" "}
        This function allows users to initialize the newly created pool
        <br />
        <br />
        <span className="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
          increase_liquidity():
        </span>{" "}
        This function allows users to add Liquidity to the pool
      </div>
      {isBuildbearNet ? <Transactions /> : null}
    </div>
  );
}

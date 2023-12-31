import { Button, Divider, Input, Select, notification } from "antd";
import React, { useEffect, useState } from "react";
import { ethers, utils } from "ethers";
import ERC20Artifact from "@openzeppelin/contracts/build/contracts/IERC20.json";
import { Address, ERC20Balance, Transactions } from "../components";
import { BASE_URL, bbSupportedERC20Tokens, bbNode } from "../constants";
import AAVE_ABI from "../helpers/aave_abi.js";
export default function Aave({
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
  const [borrowToken, setBorrowToken] = useState();
  const [withdrawtoken, setWithdrawtoken] = useState("");
  const [repaytoken, setrepaytoken] = useState();
  const [repayamount, setRepayamount] = useState("");
  const [userdata, setuserdata] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const [toToken, setToToken] = useState();
  const [value, setValue] = useState("");
  const [approvedrepay, setapprovedrepay] = useState(false);
  const [borrowamount, setborrowamount] = useState("");
  const [withdraw, setWithdraw] = useState("");
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
  async function approverepay() {
    if (repaytoken) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const ERC20Contract = new ethers.Contract(repaytoken.address, erc20ABI, signer);
      const allowance = await ERC20Contract.allowance(
        await signer.getAddress(),
        "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
      );
      console.log(allowance);
      try {
        if (utils.parseUnits(repayamount, repaytoken.decimals).gt(allowance)) {
          const approveTx = await ERC20Contract.approve(
            "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
            ethers.constants.MaxUint256,
          );
          await approveTx.wait();
          setapprovedrepay(true);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
  async function approveToken() {
    if (fromToken) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const ERC20Contract = new ethers.Contract(fromToken.address, erc20ABI, signer);
      const allowance = await ERC20Contract.allowance(
        await signer.getAddress(),
        "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
      );
      console.log(allowance);
      try {
        if (utils.parseUnits(value, fromToken.decimals).gt(allowance)) {
          const approveTx = await ERC20Contract.approve(
            "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
            ethers.constants.MaxUint256,
          );
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
      if (fromToken && value) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const ERC20Contract = new ethers.Contract(fromToken.address, erc20ABI, signer);
        const allowance = await ERC20Contract.allowance(
          await signer.getAddress(),
          "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
        );
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
      if (repaytoken && repayamount) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const ERC20Contract = new ethers.Contract(repaytoken.address, erc20ABI, signer);
        const allowance = await ERC20Contract.allowance(
          await signer.getAddress(),
          "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
        );
        try {
          if (value && utils.parseUnits(repayamount, repaytoken.decimals).lte(allowance)) {
            setapprovedrepay(true);
          } else {
            setapprovedrepay(false);
          }
        } catch (err) {
          setapprovedrepay(false);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromToken, value, repayamount, repaytoken]);

  async function lending() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const aave = new ethers.Contract("0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", AAVE_ABI, signer);

      const tx = await aave.supply(
        fromToken.address,
        utils.parseUnits(value, fromToken.decimals),
        await signer.getAddress(),
        0,
      );
      await tx.wait();

      notification.success({
        message: "Supply successful",
        description: "",
      });
      fetchdata();
    } catch (error) {}
  }

  async function borrow() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const aave = new ethers.Contract("0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", AAVE_ABI, signer);

      const tx = await aave.borrow(
        borrowToken.address,
        utils.parseUnits(borrowamount, borrowToken.decimals),
        2,
        0,
        await signer.getAddress(),
      );
      await tx.wait();

      notification.success({
        message: "Borrow successful",
        description: "",
      });
      fetchdata();
    } catch (er) {}
  }
  async function withdrawt() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const aave = new ethers.Contract("0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", AAVE_ABI, signer);

      const tx = await aave.withdraw(
        withdrawtoken.address,
        utils.parseUnits(withdraw, withdrawtoken.decimals),
        await signer.getAddress(),
      );
      await tx.wait();

      notification.success({
        message: "Withdraw successful",
        description: "",
      });
      fetchdata();
    } catch (error) {}
  }
  async function repay() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const aave = new ethers.Contract("0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", AAVE_ABI, signer);

      const tx = await aave.repay(
        repaytoken.address,
        utils.parseUnits(repayamount, repaytoken.decimals),
        2,
        await signer.getAddress(),
      );
      await tx.wait();

      notification.success({
        message: "Repay successful",
        description: "",
      });
      fetchdata();
    } catch (error) {}
  }
  async function fetchdata() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const aave = new ethers.Contract("0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", AAVE_ABI, signer);
    const tx = await aave.getUserAccountData(await signer.getAddress());
    console.log(tx);
    setuserdata(tx);
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
        <h2>Aave Lending and Borrowing :</h2>
        {/* <h4>Lend Eth and borrow DAI tokens </h4> */}
        <Divider />
        <div style={{ margin: 8 }}>
          <h4> TotalCollateralBase: {ethers.utils.formatEther(userdata[0])} </h4>
          <h4> TotalDebtBase : {ethers.utils.formatEther(userdata[1])} </h4>
          <h4> Loan To Value: {ethers.utils.formatEther(userdata[4])} </h4>
          <h4> Health Factor: {ethers.utils.formatEther(userdata[5])} </h4> <br />
          <h4> Add liquidity </h4>
          <Select
            style={{ width: "100%" }}
            placeholder="Token to Supply"
            onChange={(value, data) => {
              setFromToken({ address: value, decimals: data.decimals, symbol: data.label });
            }}
            options={toToken ? tokenArrRemove(erc20Options, toToken.symbol) : erc20Options}
          />
          <Input
            placeholder="Token amount"
            style={{ textAlign: "center" }}
            onChange={e => {
              setValue(e.target.value);
            }}
          />
          <Button style={{ marginTop: 8 }} onClick={approveToken} disabled={!(fromToken && value)}>
            {isTokenApproved ? "Approved ✅" : "Approve token"}
          </Button>
          <Button
            style={{ marginTop: 8 }}
            disabled={!(fromToken && value)}
            onClick={async () => {
              if (!isTokenApproved) {
                notification.error({
                  message: "Add Liquidity Error",
                  description: "You need to approve token first",
                });
                return;
              }
              const result = lending();
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Add Liqudity!
          </Button>
          <br /> <br />
          <h4> Withdraw Liquidity </h4>
          <Select
            style={{ width: "100%" }}
            placeholder="Token to Borrow"
            onChange={(value, data) => {
              setWithdrawtoken({ address: value, decimals: data.decimals, symbol: data.label });
            }}
            options={toToken ? tokenArrRemove(erc20Options, toToken.symbol) : erc20Options}
          />
          <Input
            placeholder="Token amount"
            style={{ textAlign: "center" }}
            onChange={e => {
              setWithdraw(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            disabled={!withdraw}
            onClick={async () => {
              const result = withdrawt();
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            withdraw!
          </Button>
          <br /> <br />
          <h4> Borrow Tokens </h4>
          <Select
            style={{ width: "100%" }}
            placeholder="Token to Borrow"
            onChange={(value, data) => {
              setBorrowToken({ address: value, decimals: data.decimals, symbol: data.label });
            }}
            options={toToken ? tokenArrRemove(erc20Options, toToken.symbol) : erc20Options}
          />
          <Input
            placeholder="Token amount to borrow"
            style={{ textAlign: "center" }}
            onChange={e => {
              setborrowamount(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            disabled={!(borrowToken && borrowamount)}
            onClick={async () => {
              const result = borrow();
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Borrow!
          </Button>
          <br /> <br />
          <h4> Repay Borrow amount </h4>
          <Select
            style={{ width: "100%" }}
            placeholder="Token to Repay"
            onChange={(value, data) => {
              setrepaytoken({ address: value, decimals: data.decimals, symbol: data.label });
            }}
            options={toToken ? tokenArrRemove(erc20Options, toToken.symbol) : erc20Options}
          />
          <Input
            placeholder="Repay amount"
            style={{ textAlign: "center" }}
            onChange={e => {
              setRepayamount(e.target.value);
            }}
          />
          <br />
          <br />
          <Button style={{ marginTop: 8 }} onClick={approverepay} disabled={!(repayamount && repaytoken)}>
            {approvedrepay ? "Approved ✅" : "Approve token"}
          </Button>
          <Button
            style={{ marginTop: 8 }}
            disabled={!approvedrepay}
            onClick={async () => {
              const result = repay();
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Repay!
          </Button>
        </div>
        <Divider />
        Aave Pool Contract Address:
        <Address
          address={"0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"}
          ensProvider={mainnetProvider}
          blockExplorer={isBuildbearNet ? `https://explorer.${BASE_URL}/${bbNode.nodeId}/` : undefined}
          fontSize={16}
        />
      </div>
      <div style={{ padding: "50px", maxWidth: "900px", margin: "auto" }}>
        <h3 style={{ margin: 8, fontSize: 20, fontWeight: 600 }}>How Lending works?</h3>
        <div style={{ margin: 8 }}>
          Entire logic of the Lending is in
          <span className="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
            Aave.sol:
          </span>{" "}
          Smart contract is present in
          <span className="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
            packages/hardhat/contracts
          </span>{" "}
          <br />
          <br />
          <span className="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
            supply():
          </span>{" "}
          This function allows users to deposit tokens into the pool
          <br />
          <br />
          <span className="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
            borrow():
          </span>{" "}
          This function allows users to borrow token tokens, using supply tokens as collateral
          <br />
          <br />
          <span className="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
            repay():
          </span>{" "}
          This function allows users to repay borrowed tokens.
          <br />
          <br />
          <span className="highlight" style={{ marginLeft: 4, padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
            withdraw():
          </span>{" "}
          This Function allows users to withdraw supply tokens from the pool.
        </div>
      </div>

      {isBuildbearNet ? <Transactions /> : null}
    </div>
  );
}

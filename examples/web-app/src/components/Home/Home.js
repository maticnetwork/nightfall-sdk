import React, { useState, useEffect } from "react";
import { UserFactory } from "nightfall-sdk";
import "./Home.css";

export default function User() {
  const [userAddress, setUserAddress] = useState();
  const [userNightfallAddress, setUserNightfallAddress] = useState();
  const [userRecipient, setUserRecipient] = useState();
  const [nightfallMnemonic, setNightfallMnemonic] = useState();
  const [clientApiUrl, setClientApiUrl] = useState();
  const [nightfallBalances, setNightfallBalances] = useState(0);
  const [nightfallMnemonicRecepient, setNightfallMnemonicRecepient] =
    useState(null);

  const tokenContractAddress = "0xa8473bEF03cBE50229a39718CBDC1fdee2F26b1a";
  const tokenErcStandard = "ERC20";
  const txValue = "0.0001";

  let createUserFirstTime = async () => {
    const nightfallUser = await UserFactory.create({
      clientApiUrl: "http://localhost:8080",
    });

    localStorage.setItem("userAddress", nightfallUser.ethAddress);
    localStorage.setItem(
      "nightfallUserAddress",
      nightfallUser.zkpKeys.compressedZkpPublicKey,
    );
    localStorage.setItem("nightfallMnemonic", nightfallUser.nightfallMnemonic);
    localStorage.setItem("clientApiUrl", nightfallUser.client.apiUrl);
  };

  let createUser = async (clientApiUrl, nightfallMnemonic) => {
    const nightfallUser = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });

    const balances = await nightfallUser.checkNightfallBalances();

    if (balances) {
      const balanceWei = Object.values(balances)[0][0].balance;
      localStorage.setItem("nightfallBalances", balanceWei);
      setNightfallBalances(balanceWei);
    }
    return nightfallUser;
  };

  window.ethereum.on("accountsChanged", function (accounts) {
    setUserAddress(accounts[0]);
    localStorage.setItem("userAddress", accounts[0]);
  });

  useEffect(() => {
    const isNightfallUser = localStorage.getItem("nightfallUserAddress");
    const clientApiUrl = localStorage.getItem("clientApiUrl");
    const nightfallMnemonic = localStorage.getItem("nightfallMnemonic");

    if (isNightfallUser) {
      // Not logging for the first time, create user with stored clientApiUrl and nightfallMnemonic
      createUser(clientApiUrl, nightfallMnemonic);
    } else {
      // Logging in for the first time create a new user and store his credentials in localStorage for future use
      createUserFirstTime();
    }

    setUserNightfallAddress(localStorage.getItem("nightfallUserAddress"));
    setUserAddress(localStorage.getItem("userAddress"));
    setNightfallMnemonic(localStorage.getItem("nightfallMnemonic"));
    setClientApiUrl(localStorage.getItem("clientApiUrl"));
    setNightfallBalances(localStorage.getItem("nightfallBalances"));
  }, []);

  async function makeDeposit(clientApiUrl, nightfallMnemonic) {
    // Create a user with clientApiUrl and nightfallMnemonic
    const nightfallUser = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });
    // Make a deposit for the user
    const txReceipts = await nightfallUser.makeDeposit({
      tokenContractAddress: tokenContractAddress,
      tokenErcStandard: tokenErcStandard,
      value: txValue,
    });
    const balanceWei = Object.values(balances)[0][0].balance;
    // Update the new balance
    setNightfallBalances(balanceWei);
    return txReceipts;
  }

  async function makeTransfer(clientApiUrl, nightfallMnemonicSender) {
    // Create a user that will transfer funds
    console.log("MNEMONIC SENDER", nightfallMnemonicSender);
    console.log("CLIENT API URL", clientApiUrl);

    const nightfallUserSender = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonicSender,
    });
    // Create a user that will recieve funds
    const nightfallUserRecepient = await UserFactory.create({
      clientApiUrl,
    });
    setNightfallMnemonicRecepient(
      nightfallUserRecepient.getNightfallMnemonic(),
    );

    const recepientAddress = nightfallUserRecepient.getNightfallAddress();
    console.log("recipien address", recepientAddress);
    console.log("sender address", nightfallUserSender.getNightfallAddress());

    // Make a transfer to the nightfall address of the recipient
    const txReceipts = await nightfallUserSender.makeTransfer({
      tokenContractAddress: tokenContractAddress,
      tokenErcStandard: tokenErcStandard,
      value: "0.0001",
      recipientNightfallAddress: recepientAddress,
    });
    return txReceipts;
  }
  async function makeWithdrawal(clientApiUrl, nightfallMnemonic) {
    // Create a user with clientApiUrl and nightfallMnemonic
    const nightfallUser = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });

    const txReceipts = await nightfallUser.makeWithdrawal({
      tokenContractAddress: tokenContractAddress,
      tokenErcStandard: tokenErcStandard,
      value: txValue,
    });
  }

  async function checkBalances(clientApiUrl, nightfallMnemonic) {
    const nightfallUser = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });
    const balance = await nightfallUser.checkNightfallBalances();
    setNightfallBalances(Object.values(balance)[0][0].balance);

    return balance;
  }
  return (
    <div>
      <div className="container-md home-container">
        <h5 className="section">
          Nightfall address:<div>{userNightfallAddress}</div>
        </h5>

        <h6 className="section">Create a deposit of 0.0001 TEST Matic</h6>
        <button
          className="nf-button"
          onClick={() => makeDeposit(clientApiUrl, nightfallMnemonic)}
        >
          {" "}
          Deposit
        </button>
        {/* <h6 className="section">Create a transfer of 0.0001 TEST Matic</h6>
        <button
          className="nf-button"
          onClick={() => makeTransfer(clientApiUrl, nightfallMnemonic)}
        >
          {" "}
          Transfer
        </button>
        <h6 className="section">Create a withdrawal of 0.0001 TEST Matic</h6>
        <button
          className="nf-button"
          onClick={() => makeWithdrawal(clientApiUrl, nightfallMnemonic)}
        >
          {" "}
          Withdrawal
        </button> */}
        <div className="section">
          Your Nightfall Balance is:{" "}
          {nightfallBalances ? nightfallBalances : "0"}
        </div>
        <button
          className="nf-button"
          onClick={() =>
            checkBalances(
              clientApiUrl,
              nightfallMnemonic,
              nightfallMnemonicRecepient,
            )
          }
        >
          Check Balance
        </button>
      </div>
    </div>
  );
}

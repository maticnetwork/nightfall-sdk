import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";

import { UserFactory } from "nightfall-sdk";

const App = () => {
  //set the user in the state of the application
  const [userAddress, setUserAddress] = useState();
  const [user, setUser] = useState();
  const [userRecipient, setUserRecipient] = useState();
  const [nightfallBalances, setNightfallBalances] = useState(null);

  const tokenContractAddress = "0xa8473bEF03cBE50229a39718CBDC1fdee2F26b1a";
  const tokenErcStandard = "ERC20";
  const txValue = "1";

  useEffect(async () => {
    const nigthfallUser = await UserFactory.create({
      clientApiUrl: "http://localhost:8080",
    });

    const userRecipient = await UserFactory.create({
      clientApiUrl: "http://localhost:8080",
      // ethereum private key
    });
    const balance = await nigthfallUser.checkNightfallBalances();
    setNightfallBalances(nigthfallUser.checkNightfallBalances());
    console.log("balans", JSON.stringify(balance));
    console.log("user", nigthfallUser);
    setUserAddress(nigthfallUser.ethAddress);
    setUserRecipient(userRecipient);
    setUser(nigthfallUser);
    console.log("nf1", nigthfallUser.getNightfallAddress());
    console.log("nf2", userRecipient.getNightfallAddress());
  }, []);

  async function makeDeposit(nigthfallUser) {
    console.log("test");
    console.log(nigthfallUser);
    const txReceipts = await nigthfallUser.makeDeposit({
      tokenContractAddress: tokenContractAddress,
      tokenErcStandard: tokenErcStandard,
      value: txValue,
    });
    return txReceipts;
  }
  async function makeTransfer(nigthfallUser, userRecipient) {
    console.log("nf1", nigthfallUser.getNightfallAddress());
    console.log("nf2", userRecipient.getNightfallAddress());

    const recepientAddress = userRecipient.getNightfallAddress();
    const txReceipts = await nigthfallUser.makeTransfer({
      tokenContractAddress: tokenContractAddress,
      tokenErcStandard: tokenErcStandard,
      value: txValue,
      recipientNightfallAddress: recepientAddress,
    });
    return txReceipts;
  }
  async function makeWithdrawal(nigthfallUser) {
    const txReceipts = await nigthfallUser.makeWithdrawal({
      tokenContractAddress: tokenContractAddress,
      tokenErcStandard: tokenErcStandard,
      value: txValue,
    });
  }

  async function checkBalances(nightfallUser) {
    const balance = await nightfallUser.checkNightfallBalances();
    console.log("BALANCE", balance);
    setNightfallBalances(balance);
  }

  return (
    <div>
      <h1>Hello Nightfall SDK </h1>
      <h3>User address: {userAddress}</h3>
      <button onClick={() => makeDeposit(user)}> Deposit</button>
      <button onClick={() => makeTransfer(user, userRecipient)}>
        {" "}
        Transfer
      </button>
      <button onClick={() => makeWithdrawal(user)}> Withdrawal</button>
      <div>Nightfall Balance</div>
      <button onClick={() => checkBalances(user)}>Check Balance</button>
      {/* <div>{nightfallBalances}</div> */}
    </div>
  );
};
ReactDOM.render(<App />, document.getElementById("app"));

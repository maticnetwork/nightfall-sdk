import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";

import { UserFactory } from "nightfall-sdk";

const App = () => {
  const [userAddress, setUserAddress] = useState();

  useEffect(async () => {
    const nigthfallUser = await UserFactory.create({
      clientApiUrl: "http://localhost:8080",
    });

    console.log("user", nigthfallUser);
    setUserAddress(nigthfallUser.ethAddress);

    const tokenContractAddress = "0xa8473bEF03cBE50229a39718CBDC1fdee2F26b1a";
    const tokenErcStandard = "ERC20";
    const txValue = "1";

    const txReceipts = await nigthfallUser.makeDeposit({
      tokenContractAddress: tokenContractAddress,
      tokenErcStandard: tokenErcStandard,
      value: txValue,
    });
  }, []);

  return (
    <div>
      <h1>Nightfall SDK </h1>
      <h3>User address: {userAddress}</h3>
    </div>
  );
};
ReactDOM.render(<App />, document.getElementById("app"));

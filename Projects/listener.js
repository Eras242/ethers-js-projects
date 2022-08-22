import chalk from "chalk";
import { ethers } from "ethers";
const INFURA_KEY = "62dc490feac442098dcb4fc1ecaa2dc0";

const main = async function () {
  console.log(
    `[  ${new Date().toLocaleTimeString()}  ]  Connecting via Websocket ...`
  );

  const provider = new ethers.providers.WebSocketProvider(
    `wss://ropsten.infura.io/ws/v3/${INFURA_KEY}`,
    "ropsten"
  );

  const network = provider
    .getNetwork()
    .then((res) =>
      console.log(
        `[  ${new Date().toLocaleTimeString()}  ]  Connected to: ${res.name}`
      )
    );


  const pendingTxs = () => {
    provider.on("pending", (tx) => {
      console.log(
        `[  ${new Date().toLocaleTimeString()}  ]  New Transaction: ${tx}`
      );
    });
  };

  // pendingTxs();
};

main();

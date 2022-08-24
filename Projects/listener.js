import chalk from "chalk";
import { ethers } from "ethers";
import ERC20ABI from "../Abi/ERC20ABI.json" assert { type: "json" };
const INFURA_KEY = "62dc490feac442098dcb4fc1ecaa2dc0";

const main = async function () {
  console.log(
    `[  ${new Date().toLocaleTimeString()}  ]  Connecting via Websocket ...`
  );

  const provider = new ethers.providers.WebSocketProvider(
    `wss://mainnet.infura.io/ws/v3/${INFURA_KEY}`,
    "mainnet"
  );

  const network = provider
    .getNetwork()
    .then((res) =>
      console.log(
        `[  ${new Date().toLocaleTimeString()}  ]  Connected to: ${res.name}`
      )
    );

  // const iface = new ethers.utils.Interface(ERC20ABI);
  // const tx = await provider.getTransaction(
  //   "0x8df3112f885f5816b0c668ab8a4f7bdce5f9615ae82cbe6100b60cfd4ae68fdf"
  // );
  // const dcTx = iface.parseTransaction(tx);
  // const token = new ethers.Contract(tx.to, ERC20ABI, provider);
  // const tokenName = await token.name();
  // console.log(tokenName);
  const transferSig = "0xa9059cbb";

  const pendingTxs = () => {
    provider.on("pending", async (transaction) => {
      if (transaction) {
        const tx = await provider.getTransaction(transaction);
        if (tx)
          if (tx.data.indexOf(transferSig) !== -1) {
            const token = new ethers.Contract(tx.to, ERC20ABI, provider);
            const symbol = await token.symbol();
            console.log(
              ` [ ${chalk.bgBlue(" TRANSFER ")} ] ${transaction.slice(
                0,
                6
              )} ${symbol} `
            );
          }
      }
    });
  };

  pendingTxs();
};

main();

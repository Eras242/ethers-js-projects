const { InfuraProvider } = require("@ethersproject/providers");
const { ethers, Wallet } = require("ethers");
const WETH = require("./Abi/WETH");
const INFURA_KEY = "62dc490feac442098dcb4fc1ecaa2dc0";
const ERC20ABI = require("./Abi/ERC20ABI.json");
const UniswapV2FactoryABI = require("./Abi/UniswapV2FactoryABI.json");
const UniswapV2PairABI = require("./Abi/UniswapV2PairABI.json");
const UniswapV2Router = require("./Abi/UniswapV2Router.json");

const PRIVATE_KEY =
  "6b461a0c6441d90372c4ed745ef0f2255287b2af325204883636bb0e36c35d8c";

async function main() {
  // BASIC SETUP

  const provider = new ethers.providers.InfuraProvider("ropsten", INFURA_KEY);

  const wallet = new Wallet(PRIVATE_KEY, provider);
  const ethBalance = await provider.getBalance(wallet.address);

  // TOKENS
  const weth = new ethers.Contract(
    "0xc778417E063141139Fce010982780140Aa0cD5Ab",
    WETH,
    wallet
  );

  const dai = new ethers.Contract(
    "0xaD6D458402F60fD3Bd25163575031ACDce07538D",
    ERC20ABI,
    wallet
  );

  const UniV2Factory = new ethers.Contract(
    "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    UniswapV2FactoryABI,
    wallet
  );

  const UniV2Router = new ethers.Contract(
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    UniswapV2Router,
    wallet
  );

  console.log("\nCONNECTED TO: ", provider.network.name);
  console.log(`Connected with address: ${wallet.address}`);
  console.log(
    `Balance: ${ethers.utils
      .formatUnits(ethBalance.toString(), "ether")
      .toString()
      .slice(0, 6)} ETH \n`
  );

  console.log("INTERACTING WITH CONTRACT: UniswapV2Factory");
  console.log(`///////////////////////////// \n`);

  const daiBal = await dai.balanceOf(wallet.address);
  const wethBal = await weth.balanceOf(wallet.address);

  console.log("DAI Balance: ", ethers.utils.formatUnits(daiBal));
  console.log("WETH Balance: ", ethers.utils.formatUnits(wethBal));

  const pair = await UniV2Factory.getPair(dai.address, weth.address).then(
    (res) => new ethers.Contract(res, UniswapV2PairABI, wallet)
  );

  const pairReserves = [];
  await pair.getReserves().then((res) => {
    res.slice(0, 2).map((i) => pairReserves.push(i.toString()));
  });
  console.log("DAI-WETH UniswapV2 pool: ", pair.address);
  console.log(pairReserves.map((i) => i));

  const daiPerWeth = pairReserves[0] / pairReserves[1];
  const wethPerDai = pairReserves[1] / pairReserves[0];

  console.log(`DAI / WETH: ${daiPerWeth}`);
  console.log(`WETH / DAI: ${wethPerDai}`);

  // const amountIn = Number(wethBal.toString()) * 0.1;
  const amountIn = wethBal * 0.1;
  console.log(amountIn);
  const amountOutMin = await UniV2Router.getAmountsOut(amountIn, [
    weth.address,
    dai.address,
  ]).then((res) => res.slice(1)[0].toString());
  console.log(amountOutMin);
  const path = [weth.address, dai.address];
  const to = wallet.address;
  const time = new Date();
  const deadline = (time.getTime() / 1000 + 600).toFixed();

  const approveTx = await weth.approve(UniV2Router.address, amountIn);
  console.log(approveTx);
  const tx = await UniV2Router.swapExactTokensForTokens(
    amountIn,
    amountOutMin,
    path,
    to,
    deadline
  );
  console.log(await tx.hash);

  // // 10% OF WALLET WETH BALANCE TO SWAP
  // const AFTER_FEE = amountIn - amountIn * 0.03;
  // const amountOutMin = AFTER_FEE * Math.trunc(daiPerWeth);
  // console.log(amountOutMin);
  // const path = "";
  // const to = "";
  // const deadline = "";
  // // await weth.approved;
}

main();

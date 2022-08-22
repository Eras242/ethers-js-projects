const { InfuraProvider } = require("@ethersproject/providers");
const { ethers, Wallet } = require("ethers");
const WETH = require("./Abi/WETH");
const INFURA_KEY = "62dc490feac442098dcb4fc1ecaa2dc0";
const ERC20ABI = require("../Abi/ERC20ABI.json");
const UniswapV2FactoryABI = require("../Abi/UniswapV2FactoryABI.json");
const UniswapV2PairABI = require("../Abi/UniswapV2PairABI.json");
const UniswapV2Router = require("../Abi/UniswapV2Router.json");

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

  // Getting our DAI and WETH balances
  const daiBal = await dai.balanceOf(wallet.address);
  const wethBal = await weth.balanceOf(wallet.address);

  // CONTRACTS
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

  console.log("DAI Balance: ", ethers.utils.formatUnits(daiBal));
  console.log("WETH Balance: ", ethers.utils.formatUnits(wethBal));

  // Get Uniswap Token pair of DAI & WETH
  const pair = await UniV2Factory.getPair(dai.address, weth.address).then(
    (res) => new ethers.Contract(res, UniswapV2PairABI, wallet)
  );

  // Get Reserves of pair, returns array of [DAI, WETH] reserves
  const pairReserves = pair.getReserves().then((res) => {
    res.slice(0, 2);
  });
  console.log("DAI-WETH UniswapV2 pool: ", pair.address);
  console.log(pairReserves.map((i) => i));

  // Calculating exchange rates
  // eg. 1 DAI = ?? WETH
  //     1 WETH = ?? DAI
  const daiPerWeth = pairReserves[0] / pairReserves[1];
  const wethPerDai = pairReserves[1] / pairReserves[0];

  console.log(`DAI / WETH: ${daiPerWeth}`);
  console.log(`WETH / DAI: ${wethPerDai}`);

  // -- SWAP

  // amountIn - The amount of tokens we want to swap from
  const amountIn = wethBal * 0.1;
  console.log(amountIn);

  // amountOutMin - The minimum amount of tokens we want to receive
  const amountOutMin = await UniV2Router.getAmountsOut(amountIn, [
    weth.address,
    dai.address,
  ]).then((res) => res.slice(1)[0].toString());
  console.log(amountOutMin);

  // path - The path our swap will take eg. from [weth.address] to ... [...] to [dai.address]
  const path = [weth.address, dai.address];

  // to - recipient of tokens
  const to = wallet.address;

  // deadline - Maximum amount of time for our swap before the transaction reverts.
  const time = new Date();
  const deadline = (time.getTime() / 1000 + 600).toFixed();

  // We need to approve the UniswapV2Router to use our tokens
  const approveTx = await weth.approve(UniV2Router.address, amountIn);
  console.log(approveTx);

  // Initiate the swap
  const tx = await UniV2Router.swapExactTokensForTokens(
    amountIn,
    amountOutMin,
    path,
    to,
    deadline
  );

  const swapTxhash = await tx.hash;
  console.log(swapTxhash);

  // Manual amounts out math
  // // 10% OF WALLET WETH BALANCE TO SWAP
  // const TOTAL_AMOUNT_AFTER_FEE = amountIn - amountIn * 0.03;
  // const amountOutMin = AFTER_FEE * Math.trunc(daiPerWeth);
  // console.log(amountOutMin);
  // const path = "";
  // const to = "";
  // const deadline = "";
  // // await weth.approved;
}

main();

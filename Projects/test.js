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

  const interestingHash =
    "0x122dc3b19410d04024dce816992366e149c5edb0e619defb689d82402df266a9";

  const tx = await provider.getTransaction(interestingHash);

  const ABI = [
    "function get() public view returns (uint)",
    "function put(uint value) public",
  ];

  const iface = new ethers.utils.Interface(ABI);
  let decodedData = iface.parseTransaction({ data: tx.data, value: tx.value });
  console.log(iface);
  console.log(tx.data);
  console.log(tx);
  console.log(decodedData);
}

main();

//This was a speed test 
//SetInterval 250ms is faster thatn provider.on("block")

const { ethers } = require("ethers");
const { Web3 } = require("web3");

let spawnerABI = require("./spawnerABI.json");
let pndcABI = require("./pndcABI.json");
let rigABI = require("./miningRig.json");
const config = require("./config.json").TESTNET; //Set bot to use testnet or mainnet

let usesLeftForSpawn;
let spawning = false;
var provider = config.RPC;
const ethProvider = new ethers.providers.JsonRpcProvider(provider);
var web3Provider = new Web3.providers.HttpProvider(provider);
var web3 = new Web3(web3Provider);


var ethMiningRig = new ethers.Contract(config.MINING_RIG, rigABI, ethProvider);
var miningRig = new web3.eth.Contract(rigABI, config.MINING_RIG);


ethProvider.on("block", async (blockNumber) => {
  await ethMiningRig.usesLeftForSpawn().then((res) => {
    if (parseInt(res) < 1) {
      console.log("Spawning Time from provider on block");
    }
  });
});

let checkForUpdates = setInterval(async () => {
  await miningRig.methods
    .usesLeftForSpawn()
    .call({ defaultBlock: "latest" })
    .then((res) => (usesLeftForSpawn = parseInt(res)))
    .then((res) => {
      if (usesLeftForSpawn < 1 && !spawning) {
        clearInterval(checkForUpdates);
        spawning = true;
        console.log("Spawning Time from setInterval");
      }
    })
    .catch((err) =>
      console.log(`${err.message} in retriving usesLeftForSpawn`)
    );
}, 250);

const { Web3 } = require("web3");
const spawnerABI = require("./spawnerABI.json");
const pndcABI = require("./pndcABI.json");
const rigABI = require("./miningRig.json");
///Change to Mainnet

const config = require("./config.json").MAINNET; //Set bot to use testnet or mainnet
// const protectedMainnetRPC = "https://rpc.flashbots.net/?builder=f1b.io&builder=rsync&builder=beaverbuild.org&builder=builder0x69&builder=Titan&builder=EigenPhi&builder=boba-builder&builder=Gambit+Labs&builder=payload&builder=Loki&builder=BuildAI&builder=JetBuilder&builder=tbuilder&builder=penguinbuild&hint=default_logs&refund=0x9c4c0ef3198c14718c77C18e799C49bB6bc696e7%3A90"


//--------------------
//Setup
//Mainnet
//Mine
//Approve SpawnManager to use
//PNDC
//Run program
//--------------------
let spawnIndex;
let pndcBalance;
let usesLeftForSpawn;
let usesToOpenSpawn;
let spawning = false; 

let priorityFee = 150 * (10**9); //amount of GWEI wihtout decimals

var provider = config.RPC;
var web3Provider = new Web3.providers.HttpProvider(provider);
var web3 = new Web3(web3Provider);

var spawnerManager = new web3.eth.Contract(spawnerABI, config.SPAWNER_MANAGER);
var miningRig = new web3.eth.Contract(rigABI, config.MINING_RIG);
var PNDC = new web3.eth.Contract(pndcABI, config.PNDC);

var wallet = web3.eth.accounts.privateKeyToAccount(config.PRIVATE_KEY)

//getPNDC balance -> approve balance -> spawnThrouth with balance amount
init()
async function init(){

await getCurrentData()
let P = ["\\", "|", "/", "-"];
let x = 0;
let checkForUpdates = setInterval(async () => { 
  await miningRig.methods.usesLeftForSpawn().call({defaultBlock:"latest"})
    .then((res) => (usesLeftForSpawn = parseInt(res)))
    .then((res) => {
    if ((usesLeftForSpawn < 1) && !spawning) {
        clearInterval(checkForUpdates)
        spawning = true
        console.log(usesLeftForSpawn);
        console.log("It's Spawning Time!");
        console.log(spawnIndex, pndcBalance)
        // spawnThrough(spawnIndex, pndcBalance)
        }
    if(!spawning){
        process.stdout.write("\r" + P[x++]+" Mines left to open spawn: "+usesLeftForSpawn);
        x &= 3;
      // console.log("Mines left to open spawn:", usesLeftForSpawn);
    }
    })
      .catch((err) => console.log(`${err.message} in retriving usesLeftForSpawn`));
}, 250);
}

async function getCurrentData() {
   await spawnerManager.methods.spawnIndex().call({defaultBlock:"latest"}).then((res) =>{spawnIndex = res;}).catch(err=>console.log("Error retriving spawnIndex" ));
   await PNDC.methods.balanceOf(wallet.address).call({defaultBlock:"latest"}).then((res) => {pndcBalance = res;}).catch(err=>console.log("Error retriving PNDC balance"));
   await checkAllowance()
  }
async function checkAllowance(){
  await PNDC.methods.allowance(wallet.address, config.SPAWNER_MANAGER).call({defaultBlock:"latest"}).then((res)=>{
    if(res < pndcBalance){
      console.log("Need to increase the allowance to ", pndcBalance)
    }else{
      console.log("Allowance is fine")
    }
 })
}
async function spawnThrough(index, amount){ 
  // let gasLimit = await spawnerManager.methods.spawnThrough(index, amount).estimateGas()
  let baseFee = await web3.eth.getBlock("pending").then(res=> res.baseFeePerGas)
  let spawnData = spawnerManager.methods.spawnThrough(index, amount)
  let encoded = spawnData.encodeABI(); // tx hex data in MM in identical to encoded data here
  let tObject = {
    from: wallet.address,
    to: config.SPAWNER_MANAGER,
    data: encoded,
    gas: 257568,
    type: 2,
    maxFeePerGas: (baseFee * 2n)+ BigInt(priorityFee),
    maxPriorityFeePerGas: priorityFee
  }
  console.time()
  console.log("--------------\nTx created")
  web3.eth.accounts.signTransaction(tObject, config.PRIVATE_KEY, (err)=>console.log(err))
  .then(signed => {
    console.log("--------------\nTx signed\n--------------\nWaiting for confirmation...")
    web3.eth.sendSignedTransaction(signed.rawTransaction)
      .on('receipt', (res)=>{
        console.timeEnd()
        console.log(`--------------\nYour Spawn transaction at \nhttps://etherscan.io/tx/${res.transactionHash} \n--------------\n`)})

})
}
//with 150 GWEI and default priority fee: 15.278s, 40GWEI 12-10secsd
// priority fee: 3 GWEI, max Fee 3 * 1.25
//priority fee: 5, max: 5*1.25, 10s
//priority fee: 5, max: 10, 6.4s
//priority fee: 2, max: 6, 4.5s
//priority fee: 10, max: 5, error must be larger
//~550 successful tx after the first configUpdate; spawn index 1; less than 2 minutes difference between first and last tx
//usesLeftForSpawn 4741

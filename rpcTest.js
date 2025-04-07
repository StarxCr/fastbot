//-------------------
//Test of 10 attemps calling usesLeftForSpawn() method showed the following results:
//Average for Public Node was 226.9 ms
//Average for FastRPC was 233.8 ms, 233.4 ms
//Average for Sepolia rpc (https://rpc.sepolia.org) was 511.9 ms
//-------------------

const { Web3 } = require("web3");
const rigABI = require("./miningRig.json");
const config = require("./config.json").TESTNET;

const fastRPC =
  "https://eth-mainnet.rpcfast.com?api_key=dDnW5bNLFZttgvjDdbYceLoRbAClD2wOIaP9KAXMo3vgWLMwgyoLIGWtjm1gZyIu";
const sepolia = "https://rpc.sepolia.org"; 
var web3Provider = new Web3.providers.HttpProvider(sepolia);
 
var web3 = new Web3(web3Provider);
var miningRig = new web3.eth.Contract(rigABI, config.MINING_RIG);

let times = []
let interval =  setInterval(async ()=>{
    let start = Date.now()
    await miningRig.methods.usesLeftForSpawn().call({defaultBlock:"latest"}).then(res=>{
        let end = Date.now()
        times.push(end - start)
    })
    if (times.length >= 10){
        clearInterval(interval)
        let sum = times.reduce((acc, curr)=>acc+curr, 0,)
        let avg = sum / times.length
        console.log("end of loop")
        console.log(`Avg for Public node is: ${avg}`)

    }
    
}, 1500)
    

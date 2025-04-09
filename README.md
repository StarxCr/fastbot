*Repo was created more than a year ago and no longer maintained or works*

# Spawn bot 
## How does it work?
### Setup 
Installing dependecies `npm install`
Set `PRIVATE_KEY` to your private key in `config.js`. Update contracts' info and RPC if needed.
### Prerequirements
Before running script you need to *mine* PNDC and then *approve* SpawnManagerV2 contract to use it
Then you run `app.js` and script checks wether Spawn is open or not and if so spawns with all the available PNDC balance of your wallet.
### Run script 
__Run on Testnet__: Change line 5 in `app.js` to `const config = require("./config.json").TESTNET`
To run script use `node app.js`
 
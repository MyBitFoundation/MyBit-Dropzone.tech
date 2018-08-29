# Ethereum Dropzone
The Dropzone is a Dapp that allows users to select an ERC token and airdrop them to Ethereum addresses of their choosing. 


### Documentation 


### Testing 
* In the terminal run `ganache-cli`  (use -a flag to specify number of accounts ie. -a 20) 
* Open another terminal window and navigate to Contracts/test 
* run `truffle test testFileName.js` 
* NOTE: Make sure bignumber.js is installed.  `npm install bignumber.js`

### Compiling 
* In the terminal run `ganache-cli`  
* In another terminal navigate to /Contracts 
* run `truffle compile` 

### Dependencies 
* bignumber.js   `npm install bignumber.js`
* solidity-docgen  `npm install solidity-docgen`

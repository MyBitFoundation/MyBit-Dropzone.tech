var HDWalletProvider = require("truffle-hdwallet-provider");
const MNEMONIC = "myth like bonus scare over problem client lizard pioneer submit female collect";

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      gas: 6500000,
      network_id: "*",
      gasPrice: 1
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(MNEMONIC, "https://ropsten.infura.io/<your api key>")
      },
      network_id: 3,
      gas: 4000000      //make sure this gas allocation isn't over 4M, which is the max
    }
  }
};


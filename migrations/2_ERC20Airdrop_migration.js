var myb = artifacts.require("ERC20");
var burner = artifacts.require("MyBitBurner");
var airdrop = artifacts.require("ERC20Airdrop");

const PREC = 18;
const TOKEN_SUPPLY = 179997249914159265359037985; // mainnet value
console.log("PREC=" + PREC + " TOKEN_SUPPLY=" + TOKEN_SUPPLY);

module.exports = async function(deployer) {
  if (deployer.network === "development") {
    moduleExportsDev(deployer);
  }
  else if (deployer.network === "ropsten") {
    moduleExportsRopsten(deployer);
  }
}

const moduleExportsDev = function(deployer) {
  deployer.deploy(myb, TOKEN_SUPPLY, "MyBit", PREC, "MYB").then(function(mybDeployed) {
    console.log("Deploying burner with myb.address=" + myb.address);
    return deployer.deploy(burner, myb.address).then(function(burnerDeployed) {
      console.log("Deploying airdrop with burner.address=" + burner.address);
      return deployer.deploy(airdrop, burner.address).then(function(airdropDeployed) {
        burnerDeployed.authorizeBurner(airdrop.address);
        console.log("Authorized airdrop.address=" + airdrop.address + " as burner");
        writeToFile(deployer, myb.address);
      });
    });
  });
};

const moduleExportsRopsten = function(deployer) {
  const OFFICIAL_MYB_ROPSTEN="0xbb07c8c6e7CD15E2E6F944a5C2CAC056c5476151";
  console.log("Deploying burner with myb.address=" + OFFICIAL_MYB_ROPSTEN);
  return deployer.deploy(burner, OFFICIAL_MYB_ROPSTEN).then(function(burnerDeployed) {
    console.log("Deploying airdrop with burner.address=" + burner.address);
    return deployer.deploy(airdrop, burner.address).then(function(airdropDeployed) {
      burnerDeployed.authorizeBurner(airdrop.address);
      console.log("Authorized airdrop.address=" + airdrop.address + " as burner");
      writeToFile(deployer, OFFICIAL_MYB_ROPSTEN);
    });
  });
};

const writeToFile = function(deployer, mybAddress) {
  console.log("-------------------------------------------------------------------");
  console.log("MyBit contract = " + mybAddress);
  console.log("MyBitBurner contract = " + burner.address);
  console.log("ERC20Airdrop contract = " + airdrop.address);
  console.log("-------------------------------------------------------------------");

  const fs = require('fs');
  contractAddresses =
    "export const TOKEN_ADDRESS = '" + mybAddress + "';\n" +
    "export const BURNER_ADDRESS = '" + burner.address + "';\n" +
    "export const AIRDROP_ADDRESS = '" + airdrop.address + "';";

  var subdir = (deployer.network === "ropsten" ? "ropsten" : "private");
  var filename = './front-end/app/constants/contracts/' + subdir + '/ContractAddresses.js';
  fs.writeFile(filename, contractAddresses, (err) => {
    if (err) {
      console.log("Error writing contract addresses!");
    } else {
      console.log('Wrote contract addresses to: ' + filename);
    }
  });
};

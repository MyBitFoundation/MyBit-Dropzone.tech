import dayjs from 'dayjs';
import getWeb3Async from './web3';
import * as CloudLogger from './cloudLogger';
import * as BigNumber from 'bignumber.js';

import * as ContractAddressesRopsten from '../constants/contracts/ropsten/ContractAddresses';
import * as MyBitBurnerRopsten from '../constants/contracts/ropsten/MyBitBurner';
import * as MyBitTokenRopsten from '../constants/contracts/ropsten/MyBitToken';
import * as ERC20AirdropRopsten from '../constants/contracts/ropsten/ERC20Airdrop';

import * as ContractAddressesPrivate from '../constants/contracts/private/ContractAddresses';
import * as MyBitTokenPrivate from '../constants/contracts/private/MyBitToken';
import * as MyBitBurnerPrivate from '../constants/contracts/private/MyBitBurner';
import * as ERC20AirdropPrivate from '../constants/contracts/private/ERC20Airdrop';

import * as MyBitBurnerMainnet from '../constants/contracts/mainnet/MyBitBurner';
import * as MyBitTokenMainnet from '../constants/contracts/mainnet/MyBitToken';

import {
  ETHERSCAN_TX,
  ETHERSCAN_TX_FULL_PAGE
} from '../constants';
import axios from 'axios';
const Web3 = getWeb3Async();

const burnValue = "250";
const burnValueWei = Web3.utils.toWei(burnValue, 'ether');

const getContract = (name, network, address) => {
  let contract = undefined;
  if (network === "ropsten") {
    switch (name) {
      case 'ERC20Airdrop':
        address = ContractAddressesRopsten.AIRDROP_ADDRESS;
        contract = ERC20AirdropRopsten;
        break;
      case 'MyBitBurner':
        address = ContractAddressesRopsten.BURNER_ADDRESS;
        contract = MyBitBurnerRopsten;
        break;
      case 'MyBitToken':
        address = ContractAddressesRopsten.TOKEN_ADDRESS;
        contract = MyBitTokenRopsten;
        break;
    }
  } else if (network === "private") {
    switch (name) {
      case 'ERC20Airdrop':
        address = ContractAddressesPrivate.AIRDROP_ADDRESS;
        contract = ERC20AirdropPrivate;
        break;
      case 'MyBitBurner':
        address = ContractAddressesPrivate.BURNER_ADDRESS;
        contract = MyBitBurnerPrivate;
        break;
      case 'MyBitToken':
        address = ContractAddressesPrivate.TOKEN_ADDRESS;
        contract = MyBitTokenPrivate;
        break;
    }
  } else {
    switch (name) {
      case 'MyBitBurner':
        contract = MyBitBurnerMainnet;
        break;
      case 'MyBitToken':
        contract = MyBitTokenMainnet;
        break;
    }
  }

  return new Web3.eth.Contract(
    contract.ABI,
    address ? address : contract.ADDRESS
  );
}

export const loadMetamaskUserDetails = async (network) =>

  new Promise(async (resolve, reject) => {
    try {
      // TOO NOISY! CloudLogger.log('Entering loadMetamaskUserDetails');    

      const accounts = await Web3.eth.getAccounts();
      const balance = await Web3.eth.getBalance(accounts[0]);

      // TOO NOISY!   CloudLogger.log('Entering loadMetamaskUserDetails: accounts=' + accounts);    
      // TOO NOISY!   CloudLogger.log('Entering loadMetamaskUserDetails: accounts[0]=' + accounts[0]);    

      const myBitTokenContract = getContract("MyBitToken", network);

      let myBitBalance = await myBitTokenContract.methods
        .balanceOf(accounts[0])
        .call();

      if (myBitBalance > 0) {
        myBitBalance = myBitBalance / Math.pow(10, 18);
      }

      const details = {
        userName: accounts[0],
        ethBalance: Web3.utils.fromWei(balance, 'ether'),
        myBitBalance,
      };
      resolve(details);

      // TOO NOISY!   CloudLogger.log('loadMetamaskUserDetails: exiting normally');    
    } catch (error) {
      // TOO NOISY? need to chase these though   CloudLogger.log('loadMetamaskUserDetails: error=' + error);    
      reject(error);
    }
  });

export const getApprovalLogs = async (network) =>
  new Promise(async (resolve, reject) => {
    try {
      const mybitTokenContract = getContract("MyBitToken", network);

      const logApprovals = await mybitTokenContract.getPastEvents(
        'Approval', {
          fromBlock: 0,
          toBlock: 'latest'
        },
      );

      resolve(logApprovals);

    } catch (error) {
      reject(error);
    }
  });

export const requestBurnerApproval = async (address, network, feeToken) =>
  new Promise(async (resolve, reject) => {
    const burnerContract = getContract("MyBitBurner", network);
    const burnerAddress = burnerContract.options.address;
    requestApproval(address, burnerAddress, network, feeToken, resolve, reject);
  });

export const requestAirdropApproval = async (address, network, totalAmountToken) =>
  new Promise(async (resolve, reject) => {
    const airdropContract = getContract("ERC20Airdrop", network);
    const airdropAddress = airdropContract.options.address;
    requestApproval(address, airdropAddress, network, totalAmountToken, resolve, reject);
  });
  
const requestApproval = async (address, contractAddress, network, amountToken, resolve, reject) =>
  {
    var USER_LABEL = ("" + address).substring(0, 8);
    try {
      CloudLogger.log(USER_LABEL + ' Entering core.requestApproval for amountToken=' + amountToken + ' contractAddress=' + contractAddress);

      const amountWei = Web3.utils.toWei(amountToken.toString(), 'ether');
      const mybitTokenContract = getContract("MyBitToken", network);

      const contractAllowance = await mybitTokenContract.methods.allowance(address, contractAddress).call();
      var allowanceSurplus = new BigNumber(contractAllowance).minus(amountWei);
      CloudLogger.log(USER_LABEL + ' core.requestApproval: contractAllowance=' + contractAllowance +
        ' amountWei=' + amountWei + ' allowanceSurplus=' + allowanceSurplus +
        ' for contractAddress=' + contractAddress);

      if (allowanceSurplus.lt(0)) {
        CloudLogger.log(USER_LABEL + ' core.requestApproval: estimating gas for amountWei=' + amountWei);
        const estimatedGas = await mybitTokenContract.methods.approve(contractAddress, amountWei).estimateGas({
          from: address
        });
        const gasPrice = await Web3.eth.getGasPrice();

        CloudLogger.log(USER_LABEL + ' core.requestApproval: calling approve for amountWei=' + amountWei);
        const approveResponse = await mybitTokenContract.methods
          .approve(contractAddress, amountWei)
          .send({
            from: address,
            gas: estimatedGas,
            gasPrice: gasPrice
          });
        CloudLogger.log(USER_LABEL + ' core.requestApproval: approveResponse=' + approveResponse);
        
        const {
          transactionHash
        } = approveResponse;
        checkTransactionStatus(transactionHash, resolve, reject, network);
      }
      else {
        CloudLogger.log(USER_LABEL + ' core.requestApproval: allowance already enough for contractAddress=' + contractAddress);
        resolve(true);
      }
    } catch (error) {
      CloudLogger.log(USER_LABEL + ' core.requestApproval: ERROR=' + error);
      reject(error);
    }
  };

export const getAllowanceOfAddress = async (address, network) =>
  new Promise(async (resolve, reject) => {
    try {
      const mybitTokenContract = getContract("MyBitToken", network);

      const allowance = await mybitTokenContract.methods.allowance(address, network === "ropsten" ? MyBitBurnerRopsten.ADDRESS : MyBitBurnerMainnet.ADDRESS).call();
      resolve(allowance >= burnValueWei);
    } catch (error) {
      reject(error);
    }
  });

export const getAirdropLog = async (network) =>
  new Promise(async (resolve, reject) => {
    try {
      CloudLogger.log("Entering core.getAirdropLog");

      const airdropContract = getContract("ERC20Airdrop", network);
      const logTransactions = await airdropContract.getPastEvents(
        'LogTokensTransferred', {
          fromBlock: 0,
          toBlock: 'latest'
        },
      );
      resolve(logTransactions);
    } catch (error) {
      CloudLogger.log("core.getAirdropLog: error=" + error);
      reject(error);
    }
  });

export const createAirdrop = async (recipients, amount, network, sendingAddress) =>
  new Promise(async (resolve, reject) => {
    const USER_LABEL = ("" + sendingAddress).substring(0, 8);
    try {
      CloudLogger.log(USER_LABEL + ' Entering core.createAirdrop with recipients.length=' + recipients.length + ' amount=' + amount + ' sendingAddress=' + sendingAddress);

      const tokenContract = getContract("MyBitToken", network);
      const airdropContract = getContract("ERC20Airdrop", network);

      const weiAmount = Web3.utils.toWei(amount.toString(), 'ether');
      const estimatedGas = await airdropContract.methods.sendAirdropEqual(
        tokenContract.options.address, recipients, weiAmount).estimateGas({
        from: sendingAddress
      });
      const gasPrice = await Web3.eth.getGasPrice();

      CloudLogger.log(USER_LABEL + ' core.createAirdrop: calling sendAirdropEqual');

      const airdropResponse = await airdropContract.methods
        .sendAirdropEqual(
          tokenContract.options.address,
          recipients,
          weiAmount
        )
        .send({
          from: sendingAddress,
          gas: estimatedGas,
          gasPrice: gasPrice
        });

      CloudLogger.log(USER_LABEL + ' core.createAirdrop: called sendAirdropEqual, airdropResponse=' + airdropResponse);

      const {
        transactionHash
      } = airdropResponse;
      checkTransactionStatus(transactionHash, resolve, reject, network);
    } catch (error) {
      CloudLogger.log(USER_LABEL + ' core.createAirdrop: ERROR=' + error);
      alert("Exception! error=" + error);
      console.log("Exception! error=" + error);
      reject(error);
    }
  });

const checkTransactionStatus = async (
  transactionHash,
  resolve,
  reject,
  network,
) => {
  try {
    const endpoint = ETHERSCAN_TX(transactionHash, network);
    const result = await fetch(endpoint);
    const jsronResult = await result.json();

    if (jsronResult.status === '1') {
      //checkTransactionConfirmation(transactionHash, resolve, reject, network);
      resolve(true)
    } else if (jsronResult.status === '0') {
      resolve(false);
    } else {
      setTimeout(
        () => checkTransactionStatus(transactionHash, resolve, reject, network),
        1000,
      );
    }
  } catch (err) {
    reject(err);
  }
};

const checkTransactionConfirmation = async (
  transactionHash,
  resolve,
  reject,
  network,
) => {
  try {
    const url = ETHERSCAN_TX_FULL_PAGE(transactionHash, network);
    const response = await axios.get(url);
    var myRe = new RegExp('(<font color=\'green\'>Success</font>)', 'g');
    var r = myRe.exec(response.data);
    if (r.length > 0) {
      resolve(true);
    }

    myRe = new RegExp('(<font color=\'red\'>Fail</font>)', 'g');
    r = myRe.exec(response.data);
    if (r.length > 0) {
      resolve(false);
    } else {
      setTimeout(
        () => checkTransactionConfirmation(transactionHash, resolve, reject),
        1000,
      );
    }
  } catch (err) {
    setTimeout(
      () => checkTransactionConfirmation(transactionHash, resolve, reject),
      1000,
    );
  }
}

export default Web3;

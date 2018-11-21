export const ABI = 
[
  {
    "constant": true,
    "inputs": [],
    "name": "mybBurner",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "_mybTokenBurner",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "_tokenAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "_sender",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "_recipients",
        "type": "address[]"
      },
      {
        "indexed": false,
        "name": "_totalAmount",
        "type": "uint256"
      }
    ],
    "name": "LogTokensTransferred",
    "type": "event"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_tokenAddress",
        "type": "address"
      },
      {
        "name": "_recipients",
        "type": "address[]"
      },
      {
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "sendAirdropEqual",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_tokenAddress",
        "type": "address"
      },
      {
        "name": "_recipients",
        "type": "address[]"
      },
      {
        "name": "_amounts",
        "type": "uint256[]"
      }
    ],
    "name": "sendAirdrop",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

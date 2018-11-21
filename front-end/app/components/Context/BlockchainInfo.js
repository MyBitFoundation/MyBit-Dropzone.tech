import React from 'react';
import PropTypes from 'prop-types';
import BlockchainInfoContext from './BlockchainInfoContext';
import * as Core from '../../utils/core';
import Web3 from '../../utils/core';
import * as CloudLogger from '../../utils/cloudLogger';

class BlockchainInfo extends React.Component {
  constructor(props) {
    super(props);

    this.loadMetamaskUserDetails = this.loadMetamaskUserDetails.bind(this);
    this.createAirdrop = this.createAirdrop.bind(this);
    this.getTransactions = this.getTransactions.bind(this);
    this.requestBurnerApproval = this.requestBurnerApproval.bind(this);
    this.requestAirdropApproval = this.requestAirdropApproval.bind(this);
    this.checkAddressAllowed = this.checkAddressAllowed.bind(this);
    this.getNetwork = this.getNetwork.bind(this);

    this.state = {
      loading: {
        user: true,
        transactionHistory: true,
        network: true,
      },
      sentTransactions: [],
      receivedTransactions: [],
      user: {
        myBitBalance: 0,
        etherBalance: 0,
        userName: ""
      },
      createAirdrop: this.createAirdrop,
      getTransactions: this.getTransactions,
      requestBurnerApproval: this.requestBurnerApproval,
      requestAirdropApproval: this.requestAirdropApproval,
      checkAddressAllowed: this.checkAddressAllowed,
      //can be ropsten or main - else unknown
      network: ""
    };
  }

  async componentWillMount() {
    this.getTransactionsInterval = setInterval(this.getTransactions, 10000);
    this.getUserDetailsInterval = setInterval(this.loadMetamaskUserDetails, 5000);

    try {
      //we need this to pull the user details
      await this.getNetwork();

      // we need the prices and the user details before doing anything
      await Promise.all([this.loadMetamaskUserDetails(this.state.network)]);
      do {
        await this.checkAddressAllowed();
      } while (!this.state.user.userName)
      await this.getTransactions();
    } catch (err) {
      console.log(err);
    }
  }

  async getNetwork() {
    try {
      new Promise(async (resolve, reject) => {
        let network = await Web3.eth.net.getNetworkType();

        this.setState({
          network,
          loading: {
            ...this.state.loading,
            network: false,
          }
        }, () => resolve())
      });
    } catch (err) {
      setTimeout(this.getNetwork, 1000);
    }
  }

  async componentWillUnmount() {
    clearInterval(this.getTransactionsInterval);
    clearInterval(this.getUserDetailsInterval);
  }

  async requestBurnerApproval(feeToken) {
    return Core.requestBurnerApproval(this.state.user.userName, this.state.network, feeToken);
  }

  async requestAirdropApproval(totalAmountToken) {
    return Core.requestAirdropApproval(this.state.user.userName, this.state.network, totalAmountToken);
  }

  async checkAddressAllowed() {
    try {
      const allowed = await Core.getAllowanceOfAddress(this.state.user.userName, this.state.network);
      this.setState({
        userAllowed: allowed
      });
    } catch (err) {
      console.log(err);
    }
  }

  createAirdrop(recipients, amount) {
    return Core.createAirdrop(recipients, amount, this.state.network, this.state.user.userName);
  }

  async getTransactions() {
    await Core.getAirdropLog(this.state.network)
      .then(async (response) => {
        var USER_LABEL = ("" + this.state.user.userName).substring(0, 8);
        CloudLogger.log(USER_LABEL + ": BlockchainInfo.getTransactions");

        const userAddress = this.state.user.userName;
        const sentTransactions = [];

        try {
          response.forEach(transaction => {

            if (transaction.returnValues._sender === userAddress) {
              sentTransactions.push({
                tokenAddress: transaction.returnValues._tokenAddress,
                sender: transaction.returnValues._sender,
                recipients: transaction.returnValues._recipients,
                totalAmount: Web3.utils.fromWei(transaction.returnValues._totalAmount.toString(), 'ether'),
                transactionHash: transaction.transactionHash,
                blockNumber: transaction.blockNumber,
              })
            }
          })
        } catch (err) {
          CloudLogger.log(USER_LABEL + ": BlockchainInfo.getTransactions: err=" + err);
          alert(err);
          console.log(err)
        }

        this.setState({
          sentTransactions,
          loading: {
            ...this.state.loading,
            transactionHistory: false,
          }
        })
      })
      .catch((err) => {
        CloudLogger.log("BlockchainInfo.getTransactions: err (outer)=" + err);
        console.log(err);
      });
  }

  async loadMetamaskUserDetails() {
    await Core.loadMetamaskUserDetails(this.state.network)
      .then((response) => {
        this.setState({
          user: response,
          loading: { ...this.state.loading,
            user: false
          },
        });
      })
      .catch((err) => {
        setTimeout(this.loadMetamaskUserDetails, 1000);
      });
  }

  render() {
    return ( <
      BlockchainInfoContext.Provider value = {
        this.state
      } > {
        this.props.children
      } <
      /BlockchainInfoContext.Provider>
    );
  }
}

export default BlockchainInfo;

BlockchainInfo.propTypes = {
  children: PropTypes.node.isRequired,
};

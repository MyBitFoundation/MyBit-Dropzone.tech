/*
 * Create New Airdrop Page
 *
 * Page to create airdrops
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Helmet
} from 'react-helmet';
import styled from 'styled-components';
import ContainerCreate from 'components/ContainerCreate';
import Image from '../../images/secure.svg';
import Input from 'components/Input';
import H1 from 'components/H1';
import P from 'components/P';
import Web3 from '../../utils/core';
import Constants from 'components/Constants';
import Checkbox from 'antd/lib/checkbox';
import LoadingIndicator from 'components/LoadingIndicator';
import ConnectionStatus from 'components/ConnectionStatus';
import Select from 'react-select'
import topHundredEthAddresses from './topHundredEthAddresses.js';
import * as CloudLogger from '../../utils/cloudLogger';
import Button from 'components/Button';

import 'antd/lib/checkbox/style/css';

const TOP_N=50;
const TOP_N_VALUE='top-50';
const TOP_N_LABEL_STUB='Top 50';

const StyledTermsAndConditions = styled.s `
  font-size: 12px;
  font-family: 'Roboto';
  margin-bottom: 10px;
  text-decoration: none;

  a{
    color: #1890ff;
  }
`;

const StyledClickHere = styled.s `
  color: #1890ff;
  text-decoration: underline;
`;

const StyledTermsAndConditionsWrapper = styled.div `
  margin-bottom: 10px;
`;

export default class CreateNewPage extends React.Component {
  constructor(props) {
    super(props);

    CloudLogger.log('In CreateNewPage ctor');

    this.state = {
      shouldConfirm: false,
      isLoading: false,
      acceptedToS: false,
      selectedRecipient: '',
      freeTextRecipients: [''],
    }
    this.details = [];
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleAlertClosed = this.handleAlertClosed.bind(this);
  }

  handleClose() {
    this.setState({
      shouldConfirm: false,
      freeTextRecipient: '',
      amountToken: '',
    })
  }

  handleBack() {
    this.setState({
      shouldConfirm: false
    })
  }

  freeTextRecipientsAreValid() {  
    if (this.state.freeTextRecipients.length==1 && this.state.freeTextRecipients[0]==='') {
      return true;
    }
          
    for (var i=0; i<this.state.freeTextRecipients.length; i++) {
      if (false===Web3.utils.isAddress( this.state.freeTextRecipients[i] )) {
        return false;
      }
    }
    return true;
  }

  async handleConfirm() {
    CloudLogger.log('Entering CreateNewPage.handleConfirm');
    CloudLogger.log('handleConfirm: ' +
      ' this.props.user.userName=' + this.props.user.userName +
      ' this.props.user.myBitBalance=' + this.props.user.myBitBalance);
    var USER_LABEL = ("" + this.props.user.userName).substring(0, 8);

    const {
      freeTextRecipients,
      amountToken
    } = this.state;

    CloudLogger.log(USER_LABEL + ' handleConfirm: setting recipients');
    var recipients;
    if (this.state.selectedRecipient.value === TOP_N_VALUE) {
      recipients = topHundredEthAddresses(this.props.network).map(function(addr) {
        return addr.value
      }).slice(TOP_N);
    } else {
      recipients = this.state.freeTextRecipients;
    }
    CloudLogger.log(USER_LABEL + ' handleConfirm: recipients=' + recipients);
    CloudLogger.log(USER_LABEL + ' handleConfirm: recipients.length=' + recipients.length);

    let alertType = undefined;
    let alertMessage = undefined;
    this.setState({
      alertType
    })

    const minBalance = 250 + (recipients.length*amountToken);
    if (this.props.user.myBitBalance < minBalance) {
      alertMessage = < span > Your MYB balance is below {minBalance}, click < StyledClickHere onClick = {
        () => BancorConvertWidget.showConvertPopup('buy')
      } > here < /StyledClickHere> to buy more.</span >
    } else if (!this.freeTextRecipientsAreValid()) {
      alertMessage = "Please enter a valid Ethereum address.";
    } else if (!amountToken || amountToken == 0) {
      alertMessage = "Amount of MYB needs to be higher than zero.";
    }

    if (alertMessage) {
      alertType = 'error';
      this.setState({
        alertType,
        alertMessage
      })
      return;
    }

    CloudLogger.log(USER_LABEL + ' handleConfirm: balance checks passed');
    CloudLogger.log(USER_LABEL + ' handleConfirm: this.state.selectedRecipient.value=' + this.state.selectedRecipient.value);

    var displayRecipient;
    if (this.state.selectedRecipient.value === TOP_N_VALUE) {
      displayRecipient = TOP_N_LABEL_STUB + " ETH addresses";
    } else if (this.state.selectedRecipient != '') {
      displayRecipient = Constants.functions.shortenAddress(this.state.selectedRecipient.value);
    } else {
      displayRecipient = Constants.functions.shortenAddress(this.state.freeTextRecipients);
    }

    CloudLogger.log(USER_LABEL + ' handleConfirm: displayRecipient=' + displayRecipient);

    //generate details
    this.details = [];
    this.details.push({
      title: 'Recipient',
      content: [displayRecipient + "."]
    }, {
      title: 'Amount per recipient',
      content: [amountToken + " MYB"]
    })

    this.setState({
      shouldConfirm: true
    })
    this.setState({
      alertType: 'info',
      alertMessage: "Waiting for confirmations."
    });

    try {      
      const result = await this.props.requestBurnerApproval(250);
      CloudLogger.log(USER_LABEL + ' handleConfirm: called requestBurnerApproval with result=' + result);

      const result2 = await this.props.requestAirdropApproval(recipients.length * amountToken);
      CloudLogger.log(USER_LABEL + ' handleConfirm: called requestAirdropApproval with result=' + result);

      var result3;
      if (result && result2) {
        CloudLogger.log(USER_LABEL + ' handleConfirm: calling createAirdrop');
        var thePromise = this.props.createAirdrop(
          recipients,
          amountToken
        );
        result3 = await thePromise;
        CloudLogger.log(USER_LABEL + ' handleConfirm: called createAirdrop result3=' + result3);
      }
      else {
        result3 = false;
      }
      
      if (result3) {
        this.setState({
          alertType: 'success',
          alertMessage: "Transaction confirmed."
        });
      } else {
        this.setState({
          alertType: 'error',
          alertMessage: "Transaction failed. Please try again with more gas."
        });
      }
      this.props.checkAddressAllowed();
      this.props.getTransactions();
    } catch (err) {
      CloudLogger.log(USER_LABEL + ' handleConfirm: ERR=' + err);
      this.setState({
        alertType: 'error',
        alertMessage: "An error occurred: " + err
      });
    }
  }

  handleAlertClosed() {
    this.setState({
      alertType: undefined
    })
  }

  handleInputChange(text, id) {
    this.setState({
      [id]: text,
    })
  }

  handleManualRecipientChange(text, index) {
    const newRecipients = this.state.freeTextRecipients;
    newRecipients[index] = text;

    this.setState({
      selectedRecipient: '',
      freeTextRecipients: newRecipients,
    })
  }

  handleSelectedRecipientChange(option) {
    this.setState({
      selectedRecipient: option,
      freeTextRecipients: [''],
    })
  }

  render() {
    let toRender = [];
    //if(this.props.loading){
    //  return <LoadingIndicator />
    //}

    toRender.push( <
      ConnectionStatus network = {
        this.props.network
      }
      constants = {
        Constants
      }
      key = {
        "connection status"
      }
      loading = {
        this.props.loadingNetwork
      }
      />
    )

    const OrParagraph = styled.div `
      color: #2BA7F4;
      margin-top: 0px;
      text-align: center;
    `;

    const selectStyles = {
      option: (provided, state) => ({
        ...provided,
        backgroundColor: 'white',
        color: state.isSelected ? 'red' : 'blue',
      }),
    }

    const selectLabelStr = (this.props.network === "private") ? "19 local MyBit-Chain addresses" : TOP_N_LABEL_STUB+" ETH addresses";
    const selectOption = [{value: TOP_N_VALUE, label: selectLabelStr}];

    const content = ( <
      div key = "content" >
      <
      Input placeholder = "Amount in MYB"
      type = "number"
      value = {
        this.state.amountToken
      }
      onChange = {
        (number) => this.handleInputChange(number, 'amountToken')
      }
      min = {
        0
      }
      /> 

      <div>
       {this.state.freeTextRecipients.map((val, index) => 
          <Input 
            placeholder = "Recipient"
            value={val}
            onChange = {
              (e) => this.handleManualRecipientChange(e.target.value, index)
            }
            tooltipTitle = "Who will receive your funds on execution?"
            hasTooltip
         />)}
      </div>

      <div align="right">
        <Button
          styling={Constants.buttons.primary.blue}
          handleRoute={(e) => this.state.freeTextRecipients.push("")} >
          +
        </Button>
      </div>
            
      <OrParagraph >
      <
      P > or < /P> < /
      OrParagraph >

      <
      P >
      <
      Select options = {
        selectOption
      }
      styles = {
        selectStyles
      }
      onChange = {
        (e) => this.handleSelectedRecipientChange(e)
      }
      value = {
        this.state.selectedRecipient
      }
      />		 < /
      P > <
      /div>
    )

    if (this.state.shouldConfirm) {
      toRender.push( <
        ContainerCreate key = "containerConfirm"
        type = "confirm"
        handleClose = {
          this.handleClose
        }
        handleBack = {
          this.handleBack
        }
        alertType = {
          this.state.alertType
        }
        alertMessage = {
          this.state.alertMessage
        }
        handleAlertClosed = {
          this.handleAlertClosed
        }
        details = {
          this.details
        }
        />
      )
    } else {
      toRender.push( <
        ContainerCreate key = "containerCreate"
        type = "input"
        image = {
          Image
        }
        alt = "Placeholder image"
        content = {
          content
        }
        handleConfirm = {
          this.handleConfirm
        }
        alertType = {
          this.state.alertType
        }
        alertMessage = {
          this.state.alertMessage
        }
        handleAlertClosed = {
          this.handleAlertClosed
        }
        acceptedToS = {
          this.state.selectedRecipient != '' || (this.state.freeTextRecipients.length != 0 && this.state.freeTextRecipients[0] != '')
        }
        buttonLabel = "Airdrop MyBit (MYB)" /
        >
      )
    }

    return ( <
        article >
        <
        Helmet >
        <
        title > Create - MyBit Dropzone < /title> <
        meta name = "Create"
        content = "Create an airdrop via the MyBit Dropzone dApp" /
        >
        <
        /Helmet> {
        toRender
      } <
      /article>
  );
}
}

CreateNewPage.defaultProps = {
  userAllowed: false,
};

CreateNewPage.propTypes = {
  userAllowed: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    myBitBalance: PropTypes.number.isRequired,
  }).isRequired,
  loading: PropTypes.bool.isRequired,
  network: PropTypes.string.isRequired,
  loadingNetwork: PropTypes.bool.isRequired,
};

/*
 * TransactionsPage
 *
 * List all the features
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Helmet
} from 'react-helmet';
import styled from 'styled-components';
import Table from 'antd/lib/table';
import Pagination from 'antd/lib/pagination';
import 'antd/lib/table/style/css';
import 'antd/lib/pagination/style/css';
import Constants from 'components/Constants';
import ExternalUrlIcon from './external-url-icon.png';
import Img from 'components/Img';
import ConnectionStatus from 'components/ConnectionStatus';
import * as CloudLogger from '../../utils/cloudLogger';

const StyledTable = styled.div `

  .Transactions__external-icon{
    width: 20px;
    display: none;
    float: right;

    @media (max-width: 540px) {
     display: block;
    }
  }

  .Transactions__external-text{
    @media (max-width: 540px) {
     display: none;
    }
  }

  .Transactions__address-small{
    display: none;
    @media (max-width: 390px) {
     display: block;
    }
  }

  .Transactions__address-medium{
    display: none;
    @media (max-width: 720px) {
     display: block;
    }

    @media (max-width: 390px) {
     display: none;
    }
  }

  .Transactions__address-big{
    display: block;

    @media (max-width: 720px) {
     display: none;
    }

  }

  .ant-table-placeholder{
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  .ant-table-content{
    background-color: white;
    border-radius: 4px;
  }

  .ant-table-body{
    width: 650px;

    @media (max-width: 720px) {
     width: 500px;
    }

    @media (max-width: 540px) {
     width: 400px;
    }

    @media (max-width: 430px) {
     width: 340px;
    }

    @media (max-width: 390px) {
     width: 280px;
    }

    tr:last-child td{
      border: none;
    }

     th:last-child{
       display: none;
     }

     tr td:last-child{
       display: none;
     }

     th:nth-child(3){
        border-top-right-radius: 4px;
     }
  }
`;

const StyledSymbol = styled.span `
  font-weight: 500;
`;

const StyledPagination = styled.div `
  float: right;
  margin-top: 10px;
`;

export default class TransactionsPage extends React.Component {
  constructor(props) {
    super(props);

    CloudLogger.log("In transactions page constructor!");

    this.state = {
      currentPage: 0,
    }
    this.itemsPerPage = 5;
  }

  buildData() {
    const columns = [{
      title: 'Block:',
      dataIndex: 'blockNumber',
      key: 'blockNumber',
    }, {
      title: 'To:',
      dataIndex: 'recipients',
      key: 'recipients',
    }, {
      title: 'Amount:',
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
    }, {
      title: 'Status:',
      dataIndex: 'status',
      key: 'status',
      align: 'right'
    }, {}];

    const {
      currentPage
    } = this.state;
    const sentTransactions = this.props.sentTransactions.slice()
      .sort(function(a, b) {
        return a.blockNumber - b.blockNumber
      });

    const startIndex = currentPage * this.itemsPerPage;
    let endIndex = (currentPage + 1) * this.itemsPerPage;
    const rows = sentTransactions.reverse().slice(startIndex, endIndex).map(transaction => {
      let recipientsDesc = transaction.recipients.length + " recipients";
      return {
        key: transaction.transactionHash,
        blockNumber:
          <
          span > {
            transaction.blockNumber
          } <
          /span>,
        recipients:
          <
          div > { /* solution to render the table on mobile */ } <
          span className = "Transactions__address-big" > {
            transaction.recipients.length === 1 ? Constants.functions.shortenAddress(transaction.recipients[0]) : recipientsDesc
          } <
          /span> <
          span className = "Transactions__address-medium" > {
            transaction.recipients.length === 1 ? Constants.functions.shortenAddress(transaction.recipients[0], 10, 4) : recipientsDesc
          } <
          /span> <
          span className = "Transactions__address-small" > {
            transaction.recipients.length === 1 ? Constants.functions.shortenAddress(transaction.recipients[0], 5, 3) : recipientsDesc
          } <
          /span> <
          /div>,
        amount:
          <
          span > {
            (transaction.totalAmount / transaction.recipients.length).toFixed(3)
          } {
            ' '
          } <
          StyledSymbol >
          MYB <
          /StyledSymbol> <
          /span>,
        status:
          <
          a
        href = {
          `https://ropsten.etherscan.io/tx/${transaction.transactionHash}`
        }
        target = "_blank"
        rel = "noopener noreferrer" >
        <
        Img
        className = "Transactions__external-icon"
        src = {
          ExternalUrlIcon
        }
        alt = "See transaction on etherscan" /
        >
        <
        span
        className = "Transactions__external-text" >
        View on etherscan <
        /span> <
        /a>
      }
    });

    return {
      columns,
      rows
    }
  }

  render() {
    try {
      CloudLogger.log("Entering TransactionsPage.render");

      const {
        columns,
        rows
      } = this.buildData();
      const config = {
        bordered: false,
        loading: this.props.loading,
        size: 'default',
      }
      const shouldRenderPagination = !this.props.loading && rows.length > 0;
      return ( <
        div >
        <
        Helmet >
        <
        title > Transactions - MyBit Dropzone < /title> <
        meta name = "Transactions"
        content = "See your transactions on the MyBit Trust dApp" /
        >
        <
        /Helmet> <
        ConnectionStatus network = {
          this.props.network
        }
        constants = {
          Constants
        }
        loading = {
          this.props.loadingNetwork
        }
        /> <
        StyledTable >
        <
        Table { ...config
        }
        columns = {
          columns
        }
        dataSource = {
          rows
        }
        pagination = {
          false
        }
        /> <
        /StyledTable> {
          shouldRenderPagination &&
            <
            StyledPagination >
            <
            Pagination
          onChange = {
            (currentPage) => this.setState({
              currentPage: currentPage - 1
            })
          }
          total = {
            this.props.sentTransactions.length
          }
          current = {
            this.state.page + 1
          }
          pageSize = {
            5
          }
          defaultCurrent = {
            1
          }
          /> <
          /StyledPagination>
        } <
        /div>
      );
    } catch (err) {
      CloudLogger.log("TransactionsPage.render: err=" + err);
    }

  }
}

TransactionsPage.propTypes = {
  sentTransactions: PropTypes.arrayOf(PropTypes.shape({
    beneficiary: PropTypes.string.isRequired,
    transactionHash: PropTypes.string.isRequired,
    amount: PropTypes.string.isRequired,
  })).isRequired,
  loading: PropTypes.bool.isRequired,
  network: PropTypes.string.isRequired,
  loadingNetwork: PropTypes.bool.isRequired,
};
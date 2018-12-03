/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Switch, Route } from 'react-router-dom';

import HomePage from 'containers/HomePage/Loadable';
import CreateNewPage from 'containers/CreateNewPage/Loadable';
import TransactionsPage from 'containers/TransactionsPage/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import Header from 'components/Header';
import Footer from 'components/Footer';
import AppWrapper from 'components/AppWrapper';
import MyBitDropzoneLogo from 'components/MyBitDropzoneLogo';
import PageWrapper from 'components/PageWrapper';
import Button from 'components/Button';
import Constants from 'components/Constants';
import NavigationBar from 'components/NavigationBar';
import BlockchainInfoContext from 'components/Context/BlockchainInfoContext';
import { Links } from '../../constants';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {mobileMenuOpen: false}
    this.handleClickMobileMenu = this.handleClickMobileMenu.bind(this);
  }

  handleClickMobileMenu(mobileMenuOpen){
    this.setState({mobileMenuOpen});
  }

  render(){
    const { mobileMenuOpen } = this.state;
    return (
      <AppWrapper
        mobileMenuOpen={mobileMenuOpen}
      >
        <Helmet
          defaultTitle="MyBit Dropzone"
        >
          <meta name="description" content="Schedule a transaction in the ethereum network" />
        </Helmet>
        <Header
          logo={MyBitDropzoneLogo}
          links={Links}
          optionalButton
          mobileMenuOpen={mobileMenuOpen}
          handleClickMobileMenu={this.handleClickMobileMenu}
        />
        <PageWrapper>
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/sent-airdrops" component={() =>
              <BlockchainInfoContext.Consumer>
                {({ sentTransactions, loading, network }) =>  (
                    <TransactionsPage
                      sentTransactions={sentTransactions}
                      loading={loading.transactionHistory}
                      network={network}
                      loadingNetwork={loading.network}
                    />
                  )
                }
              </BlockchainInfoContext.Consumer>
            }
            />
            <Route path="/create-new" component={() =>
              <BlockchainInfoContext.Consumer>
                {({ createAirdrop, currentBlock, getTransactions, userAllowed, requestBurnerApproval, requestAirdropApproval, checkAddressAllowed, user, loading, network }) =>  (
                    <CreateNewPage
                      createAirdrop={createAirdrop}
                      currentBlock={currentBlock}
                      getTransactions={getTransactions}
                      userAllowed={userAllowed}
                      requestBurnerApproval={requestBurnerApproval}
                      requestAirdropApproval={requestAirdropApproval}
                      checkAddressAllowed={checkAddressAllowed}
                      user={user}
                      loading={loading.user}
                      network={network}
                      loadingNetwork={loading.network}
                    />
                  )
                }
              </BlockchainInfoContext.Consumer>
            }
            />
          </Switch>
        </PageWrapper>
        <Footer />
      </AppWrapper>
    );
  }
}

export default App;

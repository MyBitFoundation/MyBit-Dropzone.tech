var bn = require('bignumber.js');

const Token = artifacts.require("./ERC20.sol");
const Burner = artifacts.require("./MyBitBurner.sol");

const owner = web3.eth.accounts[0];
const user1 = web3.eth.accounts[1];
const user2 = web3.eth.accounts[2];
const tokenHolders = [user1, user2];

const tokenSupply = 180000000000000000000000000;
const tokenPerAccount = 1000000000000000000000;


contract('Burner', async() => {
  let burner;
  let token;

  it('Deploy Token', async() => {
    token = await Token.new(tokenSupply, "MyBit", 18, "MYB");
  });

  it("Spread tokens to users", async () => {
    for (var i = 0; i < tokenHolders.length; i++) {
      //console.log(web3.eth.accounts[i]);
      await token.transfer(tokenHolders[i], tokenPerAccount);
      let userBalance = await token.balanceOf(tokenHolders[i]);
      assert.equal(userBalance, tokenPerAccount);
    }
    // Check token ledger is correct
    let totalTokensCirculating = tokenHolders.length * tokenPerAccount;
    let remainingTokens = bn(tokenSupply).minus(totalTokensCirculating);
    let ledgerTrue = bn(await token.balanceOf(owner)).eq(remainingTokens);
    assert.equal(ledgerTrue, true);
  });

  it('Deploy MyBitBurner', async() => {
    burner = await Burner.new(token.address);
  });

  it('Fail to send ether', async() => {
    let err;
    try{
      await web3.eth.sendTransaction({from:user1, to: burner.address, value: 10000})
    } catch(e){
      err = e;
    }
    assert.notEqual(err, undefined);
  });

  it('Fail to burn tokens', async() => {
    let err;
    try{
      await burner.burn(user2, 1000, {from: user1});
    } catch(e){
      err = e;
      console.log('Address not authorized')
    }
    assert.notEqual(err, undefined);
  });

  it('Fail to authorize Burner', async() => {
    let err;
    try{
      await burner.authorizeBurner(user1, {from: user1});
    } catch(e){
      err = e;
    }
    assert.notEqual(err, undefined);
  });

  it('Authorize Burner', async() => {
    await burner.authorizeBurner(user1);
  });

  it('Fail to reauthorize Burner', async() => {
    let err;
    try{
      await burner.authorizeBurner(user1);
    } catch(e){
      err = e;
    }
    assert.notEqual(err, undefined);
  });

  it('Fail to burn tokens', async() => {
    let err;
    try{
      await burner.burn(user2, 1000, {from: user1});
    } catch(e){
      err = e;
      console.log('User has not given allowance');
    }
    assert.notEqual(err, undefined);
  });

  it('Burn tokens', async() => {
    await token.approve(burner.address, 1000, {from: user2});
    await burner.burn(user2, 1000, {from: user1});
  });

  it('Revoke authorization', async() => {
    await burner.removeBurner(user1);
  });

  it('Fail to revoke authorization', async() => {
    let err;
    try{
      await burner.removeBurner(user1);
    } catch(e){
      err = e;
    }
    assert.notEqual(err, undefined);
  });

});

const bn = require('bignumber.js');
const Token = artifacts.require("../ERC20.sol");
const Airdrop = artifacts.require("./ERC20Airdrop.sol");
const MyBitBurner = artifacts.require('./MyBitBurner.sol');

const owner = web3.eth.accounts[0];
const recipientsEqual = [web3.eth.accounts[1], web3.eth.accounts[2], web3.eth.accounts[3]];
const recipientsVaried = [web3.eth.accounts[4], web3.eth.accounts[5], web3.eth.accounts[6]];

const WEI = 10**18
const supply = 100000*WEI;
const tokenPerAccount = 50;
const tokensVaried = [100, 200, 300];
const burnFee = 250*WEI;

let token;
let tokenAddress;
let airdrop;
let airdropAddress;
let burner;

contract('Airdrop Contract', async (accounts) => {

  // Deploy token contract
  it("Deploy token", async () => {
   token = await Token.new(supply, "MyBit Token", 8, "MyB");
   tokenAddress = await token.address;

   assert.equal(await token.totalSupply(), supply);
   assert.equal(await token.balanceOf(owner), supply);
  });

  it ('Deploy MyBitBurner contract', async() => {
    burner = await MyBitBurner.new(tokenAddress);
  });

  it("Deploy airdrop contract", async() => {
    airdrop = await Airdrop.new(burner.address);
    airdropAddress = await airdrop.address;
    await burner.authorizeBurner(airdropAddress);
    let authTrue = await burner.authorizedBurner(airdropAddress);
    assert.equal(true, authTrue);
  });

  it('Fail equal airdrop', async() => {
    try{
      await token.approve(burner.address, 100);
      await token.approve(airdropAddress, 150);
      await airdrop.sendAirdropEqual(tokenAddress, recipientsEqual, tokenPerAccount);
    } catch(e){
      err = e;
      console.log('Not enough tokens approved for burn');
    }
    assert.notEqual(err, undefined);
  });

  it('Fail equal airdrop', async() => {
    let err;
    try{
      await token.approve(burner.address, burnFee);
      await token.approve(airdropAddress, 300000);
      await airdrop.sendAirdropEqual(tokenAddress, recipientsEqual, 100000*WEI);
    } catch(e){
      err = e;
      console.log('Sender does not have enough tokens');
    }
    assert.notEqual(err, undefined);
  });

  it('Fail equal airdrop', async() => {
    let err;
    try{
      await token.approve(burner.address, burnFee);
      await token.approve(airdropAddress, 149);
      await airdrop.sendAirdropEqual(tokenAddress, recipientsEqual, tokenPerAccount);
    } catch(e){
      err = e;
      console.log('Sender has not approved that many tokens to be sent');
    }
    assert.notEqual(err, undefined);
  });

  it('Fail equal airdrop', async() => {
    let err;
    try{
      await token.approve(burner.address, burnFee);
      await token.approve(airdropAddress, 150);
      await airdrop.sendAirdropEqual(tokenAddress, [0], 0);
    } catch(e){
      err = e;
      console.log('Token transfer failed');
    }
    assert.notEqual(err, undefined);
  });

  it('Fail equal airdrop', async() => {
    let err;
    try{
      await token.approve(burner.address, burnFee);
      await token.approve(airdropAddress, 150);
      await airdrop.sendAirdropEqual(web3.eth.accounts[1], recipientsEqual, tokenPerAccount);
    } catch(e){
      err = e;
      console.log('Token address not a contract');
    }
    assert.notEqual(err, undefined);
  });

  it("Test equal distribution", async () => {
    await token.approve(burner.address, burnFee);
    await token.approve(airdropAddress, 150);
    await airdrop.sendAirdropEqual(tokenAddress, recipientsEqual, tokenPerAccount);

    for (var i = 0; i < recipientsEqual.length; i++) {
        let userBalance = bn(await token.balanceOf(recipientsEqual[i]));
        assert.equal(userBalance.eq(tokenPerAccount), true);
    }
    // Check token ledger is correct
    const totalTokensCirculating = (recipientsEqual.length) * (tokenPerAccount);
    const remainingTokens = bn(supply).minus(totalTokensCirculating).minus(burnFee);
    console.log(Number(remainingTokens));
    console.log(Number(await token.balanceOf(owner)));
    assert.equal(bn(await token.balanceOf(owner)).eq(remainingTokens), true);
  });

  it('Fail varied airdrop', async() => {
    let err;
    try{
      await token.approve(burner.address, 100);
      await token.approve(airdropAddress, 600);
      await airdrop.sendAirdrop(tokenAddress, recipientsVaried, tokensVaried);
    } catch(e){
      err = e;
      console.log('Not enough tokens approved for burn');
    }
    assert.notEqual(err, undefined);
  });

  it('Fail varied airdrop', async() => {
    let err;
    try{
      await token.approve(burner.address, burnFee);
      await token.approve(airdropAddress, 600);
      await airdrop.sendAirdrop(tokenAddress, recipientsVaried, [100, 200]);
    } catch(e){
      err = e;
      console.log('Token transfer failed');
    }
    assert.notEqual(err, undefined);
  });

  it("Test varied distribution", async () => {
    await token.approve(burner.address, burnFee);
    await token.approve(airdropAddress, 600);
    await airdrop.sendAirdrop(tokenAddress, recipientsVaried, tokensVaried);

    for (var i = 0; i < recipientsVaried.length; i++) {
        let userBalance = await token.balanceOf(recipientsVaried[i]);
        assert.equal(userBalance, tokensVaried[i]);
    }
    // Check token ledger is correct
    const totalTokensCirculating = 750;
    const remainingTokens = bn(supply).minus(totalTokensCirculating).minus(bn(burnFee).times(2));
    assert.equal(bn(await token.balanceOf(owner)).eq(remainingTokens), true);
  });
});

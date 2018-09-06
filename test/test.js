const Token = artifacts.require("../ERC20.sol");
const Airdrop = artifacts.require("./ERC20Airdrop.sol");
const MyBitBurner = artifacts.require('./MyBitBurner.sol');

const owner = web3.eth.accounts[0];
const recipientsEqual = [web3.eth.accounts[1], web3.eth.accounts[2], web3.eth.accounts[3]];
const recipientsVaried = [web3.eth.accounts[4], web3.eth.accounts[5], web3.eth.accounts[6]];

const supply = 100000;
const tokenPerAccount = 50;
const tokensVaried = [100, 200, 300];
const burnFee = 250;

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
      console.log('Not enough tokens approved for burn');
    }
  });

  it('Fail equal airdrop', async() => {
    try{
      await token.approve(burner.address, burnFee);
      await token.approve(airdropAddress, 300000);
      await airdrop.sendAirdropEqual(tokenAddress, recipientsEqual, 100000);
    } catch(e){
      console.log('Sender does not have enough tokens');
    }
  });

  it('Fail equal airdrop', async() => {
    try{
      await token.approve(burner.address, burnFee);
      await token.approve(airdropAddress, 149);
      await airdrop.sendAirdropEqual(tokenAddress, recipientsEqual, tokenPerAccount);
    } catch(e){
      console.log('Sender has not approved that many tokens to be sent');
    }
  });

  it('Fail equal airdrop', async() => {
    try{
      await token.approve(burner.address, burnFee);
      await token.approve(airdropAddress, 150);
      await airdrop.sendAirdropEqual(tokenAddress, [0], 0);
    } catch(e){
      console.log('Token transfer failed');
    }
  });

  it('Fail equal airdrop', async() => {
    try{
      await token.approve(burner.address, burnFee);
      await token.approve(airdropAddress, 150);
      await airdrop.sendAirdropEqual(web3.eth.accounts[1], recipientsEqual, tokenPerAccount);
    } catch(e){
      console.log('Token address not a contract');
    }
  });

  it("Test equal distribution", async () => {
    await token.approve(burner.address, burnFee);
    await token.approve(airdropAddress, 150);
    await airdrop.sendAirdropEqual(tokenAddress, recipientsEqual, tokenPerAccount);

    for (var i = 0; i < recipientsEqual.length; i++) {
        let userBalance = await token.balanceOf(recipientsEqual[i]);
        assert.equal(userBalance, tokenPerAccount);
    }
    // Check token ledger is correct
    const totalTokensCirculating = (recipientsEqual.length) * (tokenPerAccount);
    const remainingTokens = supply - totalTokensCirculating - burnFee;
    assert.equal(await token.balanceOf(owner), remainingTokens);
  });

  it('Fail varied airdrop', async() => {
    try{
      await token.approve(burner.address, 100);
      await token.approve(airdropAddress, 600);
      await airdrop.sendAirdrop(tokenAddress, recipientsVaried, tokensVaried);
    } catch(e){
      console.log('Not enough tokens approved for burn');
    }
  });

  it('Fail varied airdrop', async() => {
    try{
      await token.approve(burner.address, burnFee);
      await token.approve(airdropAddress, 600);
      await airdrop.sendAirdrop(tokenAddress, recipientsVaried, [100, 200]);
    } catch(e){
      console.log('Token transfer failed');
    }
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
    const remainingTokens = supply - totalTokensCirculating - burnFee*2;
    assert.equal(await token.balanceOf(owner), remainingTokens);
  });
});

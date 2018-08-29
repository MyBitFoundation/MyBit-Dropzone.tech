pragma solidity 0.4.24;

import '../../sharedcontracts/interfaces/ERC20Interface.sol';
import '../../sharedcontracts/ERC20.sol';
import '../../sharedcontracts/ERC165.sol';
import '../../sharedcontracts/SafeMath.sol';
import '../../sharedcontracts/AddressUtils.sol';

// ------------------------------------------------------------------------
// @title A generic contract for Airdropping ERC20 tokens to a list of addresses
// @notice Can send an equal amount of tokens to each address or specify exact amounts
// TODO: Decode bytes to do airdrop using approveAndCall() (single-transaction)
// ------------------------------------------------------------------------
contract ERC20Airdrop {
    using SafeMath for uint;
    using AddressUtils for address;


    // TODO: Check for old tokens that don't have return value on transfer
    // TODO: Calculate the number of tokens for the user?
    // @notice Sends _amount of tokens to the list of _recipients
    // @param (address) _tokenAddress = The address of the token user wishes to send
    // @param (address[]) _recipients = The list of addresses user wishes to receive tokens
    // @param (uint) _amount = The amount of tokens user wishes to send
    function sendAirdropEqual(address _tokenAddress, address[] _recipients, uint _amount)
    external
    onlyContracts(_tokenAddress) {
        ERC20 thisToken = ERC20(_tokenAddress);
        uint totalAmountToSend = _amount.mul(_recipients.length);
        require(thisToken.balanceOf(msg.sender) > totalAmountToSend);      // TODO: Superfluous?
        require(thisToken.allowance(msg.sender, address(this)) >= totalAmountToSend);  // TODO: Superfluous?
        for (uint i = 0; i < _recipients.length; i++){
            require(thisToken.transferFrom(msg.sender, _recipients[i], _amount));
        }
        emit LogTokensTransferred(_tokenAddress, msg.sender, totalAmountToSend);
    }


    function sendAirdrop(address _tokenAddress, address[] _recipients, uint[] _amounts)
    external
    onlyContracts(_tokenAddress) {
        ERC20 thisToken = ERC20(_tokenAddress);
        uint totalAmountToSend;
        for (uint i = 0; i < _recipients.length; i++){
            require(thisToken.transferFrom(msg.sender, _recipients[i], _amounts[i]));
            totalAmountToSend = totalAmountToSend.add(_amounts[i]);
        }
        emit LogTokensTransferred(_tokenAddress, msg.sender, totalAmountToSend);
    }


    // TODO: implement ERC165 lookup
    modifier onlyContracts(address _tokenAddress) {
        require(_tokenAddress.isContract());
        _;
    }

    event LogTokensTransferred(address indexed _tokenAddress, address _sender, uint _totalAmount);
}

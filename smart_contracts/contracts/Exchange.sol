pragma solidity ^0.5.0;
import "./OrbitToken.sol";
import "./DexToken.sol";

contract Exchange {
	address admin;
	OrbitToken public orbitContract;
	DexToken public dexContract;
	// price of Orbit token in Dex
	// when buying Orbit and paying Dex in return
	uint256 public orbitPrice;
	// amount of ORB sold
	uint256 public tokensSold;

	//event SellOrb(address _buyer, uint256 _amount);

	constructor(OrbitToken _orbitContract, DexToken _dexContract, uint256 _orbitPrice) public {
		// the admin address is the address which deploys this contract
		// this variable is not public
		admin = msg.sender;
		// set OrbitToken address
		orbitContract = _orbitContract;
		// set DexToken address
		dexContract = _dexContract;
		//set Orbit token price (amount of DEX per ORB)
		orbitPrice = _orbitPrice;
	}

	// Transfer Tokens
	// public function, function will be called through website
	// 'payable' for sending ether?
	function transferTokens(uint256 _numberOfTokens) public payable {
		// check that transfer price is correct
		// check that there are sufficient supply of tokens for transfer
		// check that transfer is successful
		// check how many tokens are being transferred
		tokensSold = _numberOfTokens;
		// emit sell Orb Event
		//emit SellOrb(msg.sender, _numberOfTokens);
	}
}
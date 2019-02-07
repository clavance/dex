pragma solidity ^0.5.0;

// ERC20 standard requires six main functions:
// totalSupply
// balanceOf
// allowance
// transfer
// approve
// transferFrom

// and two events:
// event Transfer 
// event Approval

contract DappToken {

	// token name
	string public name = "Haha Token";

	// token symbol
	string public symbol = "HAHA";

	//token version
	string public version = "HAHA v1.0";

	//total supply
	uint256 public totalSupply;

	//Transfer event
	//users can subscribe/listen to events, receive alerts if event is triggered
	event Transfer(
		address indexed _from,
		address indexed _to,
		uint256 _value
	);

	//mapping should indicate which addresses hold what balances of tokens
	mapping(address => uint256) public balanceOf;

	constructor(uint256 _initialSupply) public {
		//msg global variable has sender method
		//for now, balance should be first address in ganache
		balanceOf[msg.sender] = _initialSupply;
		totalSupply = _initialSupply;
	}

	//transfer function
	function transfer(address _to, uint256 _value) public returns (bool success) {
		//must throw exception if msg.sender has insufficient balance
		//if require evalutes to true, function continues to execute, if not then function execution stops
		require(balanceOf[msg.sender] >= _value);

		//transfer balance, decrease balance by amount transferred
		balanceOf[msg.sender] -= _value;
		//increase balance of recipient address
		balanceOf[_to] += _value;

		//transfer event must be triggered
		emit Transfer(msg.sender, _to, _value);

		//returns a boolean true if transfer successful
		return true;
	}





	//transfer event

}

















//
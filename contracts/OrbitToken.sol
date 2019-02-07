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

contract OrbitToken {

	// token name
	string public name = "Orbit Token";

	// token symbol
	string public symbol = "ORB";

	//token version
	string public version = "ORB v1.0";

	//total supply
	uint256 private _totalSupply;

	//Transfer event
	//users can subscribe/listen to events, receive alerts if event is triggered
	event Transfer(address indexed _from, address indexed _to, uint256 _value);

	//Approval event
	event Approval(address indexed _owner, address indexed _spender, uint256 _value);

	//mapping should indicate which addresses hold what balances of tokens
	//includes required balanceOf function
	mapping(address => uint256) public balanceOf;

	//allows address to approve another address' transfers
	//includes allowance function which returns the amount which the third party is allowed to transfer on the sending user's behalf
	mapping(address => mapping(address => uint256)) public allowance;

	constructor(uint256 _initialSupply) public {
		//msg global variable has sender method
		//for now, balance should be first address in ganache
		balanceOf[msg.sender] = _initialSupply;
		_totalSupply = _initialSupply;
	}

	//_totalSupply is initialised in constructor
	function totalSupply() public view returns (uint256) {
		return _totalSupply;
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

		//Transfer event must be triggered
		emit Transfer(msg.sender, _to, _value);
		//return true if transfer successful
		return true;
	}

	//approve function allows a user to approve another user to spend tokens on their behalf
	//this would be used in to allow our exchange to transfer tokens on a user's behalf
	//trigger and log Approval event
	function approve(address _spender, uint256 _value) public returns (bool success) {

		//calls allowance function to update
		allowance[msg.sender][_spender] = _value;

		//Approval event must be triggered
		emit Approval(msg.sender, _spender, _value);
		return true;
	}

	//transferFrom function handles transfers, once the sending user approves, a third party can execute transfer
	function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {

		//check that _from address has sufficient tokens for transaction
		require(_value <= balanceOf[_from]);

		//check that allowance given to third party is large enough for transaction to succeed
		require(_value <= allowance[_from][msg.sender]);

		//update the sender's balance
		balanceOf[_from] -= _value;
		balanceOf[_to] += _value;

		//reduce allowance accordingly
		allowance[_from][msg.sender] -= _value;

		//trigger Transfer event
		emit Transfer(_from, _to, _value);
		return true;
	}
}

















//
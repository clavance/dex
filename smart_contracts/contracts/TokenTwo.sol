pragma solidity ^0.5.0;

import "./IERC20.sol";
import "./SafeMath.sol";

contract TokenOne is IERC20 {

	using SafeMath for uint256;

	string public name = "TokenTwo";
	string public symbol = "TWO";

	mapping(address => uint256) public _balances;
	mapping(address => mapping(address => uint256)) public _allowed;
	uint256 public _totalSupply;

	event Transfer (
		address indexed _from,
		address indexed _to,
		uint256 _value
	);

	//Approval event
	event Approval(address indexed _owner, address indexed _spender, uint256 _value);
	
	//constructor(uint256 _initialSupply) public {
	//	_balances[msg.sender] = _initialSupply;
	//	_totalSupply = _initialSupply;
	//}

	//check total number of tokens in existence
	function totalSupply() public view returns(uint256) {
		return _totalSupply;
	}
	
	//check balance of specified address
	//@param 'owner' is the address to query the balance of
	//returns a uint representing the amount owned by the owner address
	function balanceOf(address owner) public returns (uint256 balance) {
		return _balances[owner];
	}

	//checks the amount of tokens an owner allowed to a spender
	//@param 'owner' is the address which owns the tokens
	//@param 'spender' is the address which will spend the tokens
	//returns a uint specifying the amount of tokens available for the spender to spend
	function allowance(address owner, address spender) public view returns (uint256) {
		return _allowed[owner][spender];
	}

	//transfer token to a specified address
	//@param 'to' is the address to transfer to
	//@param value is the amount to be transferred
    function transfer(address to, uint256 value) public returns (bool) {
	    _transfer(msg.sender, to, value);
	    return true;
    }

    //approve the address to spend the specified amount of tokens on behalf of msg.sender
    //@param 'spender' is the address that will spend the funds.
    //@param 'value' is the amount of tokens which will be spent.
    function approve(address spender, uint256 value) public returns (bool) {
	    _approve(msg.sender, spender, value);
    	return true;
    }

    //transfers tokens from one address to another
    //emits an Approval event (not required by ERC20 standard)
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        _transfer(from, to, value);
        _approve(from, msg.sender, _allowed[from][msg.sender].safeSub(value));
        return true;
    }

    //increase amount of allowance an owner allows to a spender
    //approve should be called when _allowed[msg.sender][spender] == 0
    //To increment allowed value is better to use this function to avoid
    //2 calls (and wait until the first transaction is mined)
    //emits Approval event
    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        _approve(msg.sender, spender, _allowed[msg.sender][spender].safeAdd(addedValue));
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        _approve(msg.sender, spender, _allowed[msg.sender][spender].safeSub(subtractedValue));
        return true;
    }

    //called by transfer function
    //.add and .sub use SafeMath functions
    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0));

        _balances[from] = _balances[from].safeSub(value);
        _balances[to] = _balances[to].safeAdd(value);
        emit Transfer(from, to, value);
    }

    //internal function that mints an amount of token and assigns it to an account
    function _mint(address account, uint256 value) internal {
        require(account != address(0));

        _totalSupply = _totalSupply.safeAdd(value);
        _balances[account] = _balances[account].safeAdd(value);
        emit Transfer(address(0), account, value);
    }

    //internal function that burns an amount of token of a given account
    function _burn(address account, uint256 value) internal {
        require(account != address(0));

        _totalSupply = _totalSupply.safeSub(value);
        _balances[account] = _balances[account].safeSub(value);
        emit Transfer(account, address(0), value);
    }

    //called by approve function
    function _approve(address owner, address spender, uint256 value) internal {
        require(spender != address(0));
        require(owner != address(0));

        _allowed[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    //internal function that burns an amount of token of a given account
    //deducts from sender's allowance, using burn funciton
    //emits Approval event
    function _burnFrom(address account, uint256 value) internal {
        _burn(account, value);
        _approve(account, msg.sender, _allowed[account][msg.sender].safeSub(value));
    }
}





































//
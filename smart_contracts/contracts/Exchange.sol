pragma solidity ^0.5.0;
import "./IERC20.sol";
import "./SafeMath.sol";

contract Exchange {
  using SafeMath for uint256;

  address public owner;
  mapping (address => mapping (address => uint256)) public tokens;
  mapping (bytes32 => bool) public traded;

  event SetOwner(address indexed previousOwner, address indexed newOwner);
  event Deposit(address token, address user, uint256 amount, uint256 balance);
  event Withdraw(address token, address user, uint256 amount, uint256 balance);
  event Trade(address maker, address taker, address tokenBuy, address tokenSell, uint256 amountBuy, uint256 amountSell);

  constructor() public {
    owner = msg.sender; 
}

  modifier onlyOwner {
    assert(msg.sender == owner);
    _;
  }

  function() external {
    revert();
  }

  function getOwner() public returns (address out) {
    return owner;
  }

  function setOwner(address newOwner) public onlyOwner {
    emit SetOwner(owner, newOwner);
    owner = newOwner;
  }

  function depositToken(address token, uint256 amount) public {
    tokens[token][msg.sender] = tokens[token][msg.sender].safeAdd(amount);
    require(IERC20(token).transferFrom(msg.sender, address(this), amount));
    emit Deposit(token, msg.sender, amount, tokens[token][msg.sender]);
  }

  function withdrawToken(address token, uint256 amount) public returns (bool success) {
    if (tokens[token][msg.sender] < amount) revert();
    tokens[token][msg.sender] = tokens[token][msg.sender].safeSub(amount);
    emit Withdraw(token, msg.sender, amount, tokens[token][msg.sender]);
    return true;
  }

  function balanceOf(address token, address user) public view returns (uint256) {
    return tokens[token][user];
  }

/*
      tradeValues
       [0] amountBuy - the amount of the token being bought by the maker, if the whole order is filled, signed by the maker
       [1] amountSell - the amount of the token being sold by the maker, if the whole order is filled, signed by the maker
       [2] expires - the block where the order expires
       [3] nonce - the nonce of the maker's order, a nonce is a one time integer 
           between 1 and 2^256, used to make the order unique, signed by the maker
       [4] amount - the amount of the order being filled for (must be <= amountBuy, but can be a partial order), signed by the taker
       [5] tradeNonce - the nonce of the taker, signed by the taker

     tradeAddresses
       [0] tokenBuy - the address of the token being bought by the maker
       [1] tokenSell - the address of the token being sold by the taker
       [2] maker - the account address of the maker
       [3] taker - the account address of the taker

      v
       [0] maker's v from signature
       [1] taker's v from signature

      r
       [0] maker's r from signature
       [1] taker's r from signature

      s
       [0] maker's s from signature
       [1] taker's s from signature
*/

  function trade(uint256[6] memory tradeValues, address[4] memory tradeAddresses, uint8[2] memory v, bytes32[2] memory r, bytes32[2] memory s) public returns (bool success) { //should this be public?
    
    //assert(block.number <= tradeValues[2]); //checks that this is the latest block?...

    //an order is encoded containing the following information
    bytes32 orderHash = 
    keccak256(
      abi.encodePacked(
        this,
        tradeAddresses[0],  //the address of the token being bought by the maker
        tradeValues[0],     //the amount of the token being bought
        tradeAddresses[1],  //the address of the token being sold by the taker
        tradeValues[1],     //the Sell amount of the order
        tradeValues[2],     //the block where the order expires (don't know what this is?)
        tradeValues[3],     //the nonce of the maker's order
        tradeAddresses[2]));//the account address of the maker

    //ecrecover is a check to ensure that an address (containing v, r, and s values) can be built from the hashed information
    //i.e. we check that the digital signature (public key) of the maker (tradeAddresses[2]) matches the maker's order
    orderHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", orderHash));
    //v[0]: maker's v
    //r[0]: maker's r
    //s[0]: maker's s
    assert(ecrecover(orderHash, v[0], r[0], s[0]) == tradeAddresses[2]); //can change to require() or revert() instead
    
    //similarly, encode the matching trade
    bytes32 tradeHash = 
    keccak256(
      abi.encodePacked(
        orderHash,          //the order which is being matched by the taker
        tradeValues[4],     //the amount of the order the taker is buying
        tradeAddresses[3],  //the account address of the taker
        tradeValues[5]));   //the nonce of the taker

    //check that the digital signature of the taker (tradeAddresses[3]) matches the taker's trade
    tradeHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", tradeHash));
    //v[1]: taker's v
    //r[1]: taker's r
    //s[1]: taker's s
    assert(ecrecover(tradeHash, v[1], r[1], s[1]) == tradeAddresses[3]);
    //check that the trade has not been made before i.e. nonce not used before
    assert(traded[tradeHash] == false);
    //set to true now that the trade has been made to indicate that the nonce has been used
    traded[tradeHash] = true;

    //***** I AM NOT SURE IF THIS PART IS NECESSARY OR IF IT WILL BE DONE BY THE ORDER BOOK? *****//
    uint256 amount = tradeValues[4];
    //divide the amount of the order being bought by the taker, by the amount being bought by the maker
    //so if the amount being bought by both parties is exactly the same, then tradeValues[4]/tradeValues[0] = 1
    amount = amount.safeDiv(tradeValues[0]);
    //multiply the amount by the amount being sold by the maker to get the proportionate amount of the token that the taker should receive
    //so if the amounts match it simply returns tradeValues[1], the entire amount being sold by the maker
    amount = amount.safeMul(tradeValues[1]);

    //check that the taker owns at least the same amount of the token that it is selling 
    if (tokens[tradeAddresses[0]][tradeAddresses[3]] < tradeValues[4]) revert();
    //check that the maker owns at least the same amount of the token that it is buying
    if (tokens[tradeAddresses[1]][tradeAddresses[2]] < amount) revert();
    //*******************************************************************************************//

    //EXECUTE THE TRADE
    //reduce the taker's balance (tradeAddresses[3]) of the token being bought by the maker (tradeAddresses[0]) by the amount the taker is buying (tradeValues[4]))
    tokens[tradeAddresses[0]][tradeAddresses[3]] = tokens[tradeAddresses[0]][tradeAddresses[3]].safeSub(tradeValues[4]);
    //increase the maker's balance (tradeAddresses[2]) of the token being bought by the maker by the same amount
    tokens[tradeAddresses[0]][tradeAddresses[2]] = tokens[tradeAddresses[0]][tradeAddresses[2]].safeAdd(tradeValues[4]);
    
    //EXECUTE THE COUNTER-TRADE
    //reduce the maker's balance (tradeAddresses[2]) of the token being bought by the taker (tradeAddresses[1]) by the amount the maker is buying
    tokens[tradeAddresses[1]][tradeAddresses[2]] = tokens[tradeAddresses[0]][tradeAddresses[3]].safeSub(amount);
    //increase the taker's balance (tradeAddresses[3]) of the token being bought by the taker (tradeAddresses[1]) by the same amount 
    tokens[tradeAddresses[1]][tradeAddresses[3]] = tokens[tradeAddresses[0]][tradeAddresses[3]].safeAdd(amount);

    //emit Trade event to confirm the trade
    emit Trade(tradeAddresses[2], tradeAddresses[3], tradeAddresses[0], tradeAddresses[1], tradeValues[0], tradeValues[1]);
  }
}

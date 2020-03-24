# Decentralised ERC-20 Exchange on OrbitDB

This is an ERC20 token exchange. It is comprised of 3 modules: a React front-end, a database using OrbitDB, Solidity smart contracts. The modules were written separately with a pair programming approach. The exchange is integrated with the Chrome extension MetaMask.

ERC20 is a standard to which most tokens traded on the Ethereum blockchain comply. It requires that the smart contracts creating the tokens must have several standard functions, including functions to check the total supply of the token as well as to transfer funds between accounts.

A key weakness of centralised cryptocurrency exchanges is that they have a centralised point of failure, and often store users' private keys on their servers. Thus when that single point of failure of such an exchange is exploited, all users of the exchange may lose their tokens. Decentralised exchanges aim to solve this problem by removing the central storage of tokens, thus malicious actors may only hack individual users.

Further, the terms and conditions under which transactions take place in a decentralised exchange can be programmed into the logic of the exchange's smart contract, allowing tokens to be moved directly from one user's wallet to another, without the need for the exchange to act as a trusted third party.

![](https://github.com/clavance/dex/blob/master/ui.png)

## Application Architecture

![](https://github.com/clavance/dex/blob/master/overview.png)

## Smart contract functions

![](https://github.com/clavance/dex/blob/master/sc_uml.png)

## Token transfer logic

![](https://github.com/clavance/dex/blob/master/sc_logic.png)


## Usage

Exchange runs with the Google Chrome extension [MetaMask](https://metamask.io).

Run a local blockchain with Ganache on port 7545.

From the dex-front directory run `npm start` to launch the app in dev mode.

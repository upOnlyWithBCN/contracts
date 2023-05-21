// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDCoin is ERC20 {
  constructor() ERC20("USD Coin", "USDC") {
    _mint(msg.sender, 500_000 * (10**6));
  }

  function decimals() public pure override returns (uint8) {
    return 6;
  }
}

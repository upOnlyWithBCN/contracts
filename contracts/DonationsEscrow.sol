// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import { Managerial } from "./Managerial.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DonationsEscrow is Managerial {
  using SafeERC20 for IERC20;

  address payable public recipientAddress;
  address public currencyAddress;

  mapping(address => uint256) public donations;
  mapping(address => bool) public existingDonors;
  address[] public donorAddresses;

  bool public initialised = false;
  bool public completed;

  event DonationReceived(address indexed donor, uint256 amount);
  event DonationReleased(address indexed donor, uint256 amount);
  event DonationRefunded(address indexed donor, uint256 amount);
  event CampaignCompleted(uint256 amount);

  function init(
    address _adminAddress,
    address _recipientAddress,
    address _currencyAddress
  ) public {
    require(initialised == false, "This escrow has already been initialised");

    recipientAddress = payable(_recipientAddress);
    currencyAddress = _currencyAddress;
    completed = false;

    _grantRole(DEFAULT_ADMIN_ROLE, _adminAddress);
    _grantRole(MANAGER_ROLE, _adminAddress);
    _grantRole(MANAGER_ROLE, _recipientAddress);
    initialised = true;
  }

  function addDonation(address _donorAddress, uint256 amount)
    external
    onlySuperAdmin
  {
    require(_donorAddress != address(0), "A valid address is required");
    require(amount > 0, "Please input a valid donation amount");
    require(
      completed == false,
      "The donation period for this campaign has ended"
    );

    emit DonationReceived(_donorAddress, amount);

    uint256 existingDonation = 0;
    if (existingDonors[_donorAddress] == true) {
      existingDonation = donations[_donorAddress];
    }
    existingDonation += amount;
    existingDonors[_donorAddress] = true;
    donations[_donorAddress] = existingDonation;
    donorAddresses.push(payable(_donorAddress));
  }

  function releaseDonations() public onlyManagers {
    require(completed == true, "Please end this campaign first");
    require(donorAddresses.length > 0, "No donations to release");

    uint256 totalDonations = IERC20(currencyAddress).balanceOf(address(this));
    IERC20(currencyAddress).safeTransfer(recipientAddress, totalDonations);
    emit DonationReleased(recipientAddress, totalDonations);
  }

  function refundDonations() public onlyManagers {
    require(completed == true, "Please end this campaign first");
    require(donorAddresses.length > 0, "No donations to refund");

    uint256 donorSize = donorAddresses.length;
    for (uint256 i = 0; i < donorSize; i++) {
      address donorAddress = donorAddresses[i];
      uint256 amountDonated = donations[donorAddress];

      // void donor after refunding donation
      donations[donorAddress] = 0;
      existingDonors[donorAddress] = false;

      IERC20(currencyAddress).safeTransfer(donorAddress, amountDonated);

      emit DonationRefunded(donorAddress, amountDonated);
    }
  }

  function getDonorDonationAmount(address _donorAddress)
    public
    view
    returns (uint256 amount)
  {
    return donations[_donorAddress];
  }

  function completeCampaign() external onlyManagers {
    completed = true;
    uint256 totalDonations = IERC20(currencyAddress).balanceOf(address(this));
    emit CampaignCompleted(totalDonations);
  }
}

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { ethers } from "hardhat";
import { Address } from "hardhat-deploy/dist/types";
import DonationsEscrowArtifact from "../artifacts/contracts/DonationsEscrow.sol/DonationsEscrow.json";
import DonationsEscrowFactoryArtifact from "../artifacts/contracts/DonationsEscrowFactory.sol/DonationsEscrowFactory.json";
import { DonationsEscrow, DonationsEscrowFactory } from "../typechain-types";
import { ERC20 } from "../typechain-types/@openzeppelin/contracts/token/ERC20/ERC20";

// Need to set up the tokens first
describe("DonationsEscrow", async () => {
  const donationAmount = 500;
  let donationsEscrowFactory: DonationsEscrowFactory;
  let donationsEscrow: DonationsEscrow;
  let USDC: ERC20;
  let admin: SignerWithAddress;
  let donorRecipient: SignerWithAddress;
  let donor: SignerWithAddress;
  let escrowClone: DonationsEscrow;
  let escrowCloneAddress: Address;
  let secondEscrow: DonationsEscrow;

  const deployContractFixture = async () => {
    [admin, donorRecipient, donor] = await ethers.getSigners();
    const usdcFactory = await ethers.getContractFactory("USDCoin");
    USDC = (await usdcFactory.deploy()) as ERC20;
    await USDC.deployed();
    donationsEscrowFactory = (await deployContract(
      admin,
      DonationsEscrowFactoryArtifact,
      [USDC.address]
    )) as DonationsEscrowFactory;
    await donationsEscrowFactory.deployed();

    donationsEscrow = (await deployContract(
      admin,
      DonationsEscrowArtifact
    )) as DonationsEscrow;
    await donationsEscrow.deployed();
    await donationsEscrowFactory.setEscrowAddress(donationsEscrow.address);
  };

  it("Successful clone", async () => {
    await deployContractFixture();
    const transaction = await donationsEscrowFactory.createEscrow(
      donorRecipient.address
    );
    const receipt = await transaction.wait();

    await expect(transaction).to.emit(
      donationsEscrowFactory,
      "ProjectActivated"
    );

    escrowCloneAddress = receipt.events![3].args![0];
  });

  it("Non-admin setting escrow address", async () => {
    await expect(
      donationsEscrowFactory
        .connect(donorRecipient)
        .setEscrowAddress(donationsEscrow.address)
    ).to.be.revertedWith("Caller is not a superadmin");
  });

  it("Unable to add donation", async () => {
    escrowClone = new ethers.Contract(
      escrowCloneAddress,
      DonationsEscrowArtifact.abi,
      admin
    ) as DonationsEscrow;

    await expect(
      escrowClone.connect(donor).addDonation(donor.address, donationAmount)
    ).to.revertedWith("Caller is not a superadmin");
  });

  it("Add donation", async () => {
    await USDC.approve(admin.address, 10000);

    await USDC.transfer(escrowClone.address, donationAmount);

    await escrowClone.addDonation(donor.address, donationAmount);

    expect(await escrowClone.getDonorDonationAmount(donor.address)).to.equal(
      donationAmount
    );

    await USDC.approve(escrowCloneAddress, donationAmount);

    USDC.transfer(escrowClone.address, donationAmount);
    const txn = await escrowClone.addDonation(admin.address, donationAmount);

    expect(txn)
      .to.emit(escrowClone, "DonationReceived")
      .withArgs(admin.address, donationAmount);

    expect(await escrowClone.getDonorDonationAmount(admin.address)).to.equal(
      donationAmount
    );
  });

  it("Unable to release donation prior to completing campaign", async () => {
    await expect(escrowClone.releaseDonations()).to.be.revertedWith(
      "Please end this campaign first"
    );
  });

  it("End campaign", async () => {
    expect(escrowClone.completeCampaign())
      .to.emit(escrowClone, "CampaignCompleted")
      .withArgs(1000);
  });

  it("Unable to add donation after completing campaign", async () => {
    await expect(
      escrowClone.addDonation(donor.address, donationAmount)
    ).to.revertedWith("The donation period for this campaign has ended");
  });

  it("Release donations", async () => {
    expect(await USDC.balanceOf(donorRecipient.address)).to.equal(0);

    await expect(escrowClone.connect(donor).releaseDonations()).to.revertedWith(
      "Caller is not a manager"
    );

    await expect(escrowClone.connect(donorRecipient).releaseDonations())
      .to.emit(escrowClone, "DonationReleased")
      .withArgs(donorRecipient.address, 1000);
  });

  it("Full flow + refund donations", async () => {
    const receipt = await (
      await donationsEscrowFactory.createEscrow(donorRecipient.address)
    ).wait();

    secondEscrow = new ethers.Contract(
      receipt.events![3].args![0],
      DonationsEscrowArtifact.abi,
      admin
    ) as DonationsEscrow;

    await USDC.approve(secondEscrow.address, 1000);

    await USDC.transfer(secondEscrow.address, donationAmount);
    await secondEscrow.addDonation(donor.address, donationAmount);

    expect(await secondEscrow.getDonorDonationAmount(admin.address)).to.equal(
      0
    );

    expect(await secondEscrow.getDonorDonationAmount(donor.address)).to.equal(
      donationAmount
    );

    await USDC.transfer(secondEscrow.address, donationAmount);
    await secondEscrow.addDonation(admin.address, donationAmount);

    expect(await secondEscrow.getDonorDonationAmount(admin.address)).to.equal(
      donationAmount
    );
  });

  it("Refund second escrow", async () => {
    expect(secondEscrow.refundDonations()).to.revertedWith(
      "Please end this campaign first"
    );
    await secondEscrow.completeCampaign();
  });

  it("Refund second escrow", async () => {
    expect(await secondEscrow.refundDonations())
      .to.emit(secondEscrow, "DonationRefunded")
      .withArgs(donor.address, donationAmount)
      .and.to.emit(secondEscrow, "DonationRefunded")
      .withArgs(admin.address, donationAmount);
  });
});

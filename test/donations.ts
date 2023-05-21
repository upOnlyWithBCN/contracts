import { Wallet } from "ethers";
import { DonationsEscrow, DonationsEscrowFactory } from "../typechain-types";
import { ERC20 } from "../typechain-types/@openzeppelin/contracts/token/ERC20/ERC20";

// Need to set up the tokens first
describe("DonationsEscrowFactory", async () => {
  let donationsEscrowFactory: DonationsEscrowFactory;
  let donationsEscrow: DonationsEscrow;
  let USDC: ERC20;
  let admin: Wallet;
  let donorRecipient: Wallet;
});
/*
  beforeEach(async () => {
    [admin, donorRecipient] = waffle.provider.getWallets();
    const daiFactory = await ethers.getContractFactory("Material");
    mockMHP = (await daiFactory.deploy("mhp", "MHP")) as ERC20;
    mockBHP = (await daiFactory.deploy("bhp", "BHP")) as ERC20;
    await mockMHP.deployed();
    await mockBHP.deployed();

    centralizedConsumablesDeposit = (await deployContract(
      owner,
      ConsumablesDepositArtifact,
      [treasuryAddress]
    )) as CentralizedConsumablesDeposit;
    await centralizedConsumablesDeposit.deployed();
    await mockMHP.approve(centralizedConsumablesDeposit.address, 300);
  });

  it("Successful Deposit", async () => {
    const transaction = await centralizedConsumablesDeposit.deposit(
      10,
      mockMHP.address
    );
    transaction.wait();
    await expect(transaction)
      .to.emit(centralizedConsumablesDeposit, "Deposit")
      .withArgs(owner.address, 10, mockMHP.address);

    expect(await mockMHP.balanceOf(treasury.address)).to.eq(10);
  });

  it("Failed Deposit", async () => {
    await expect(
      centralizedConsumablesDeposit.deposit(500, mockMHP.address)
    ).to.revertedWith("ERC20: insufficient allowance");
  });

  it("Transfer Ownership", async () => {
    await centralizedConsumablesDeposit.transferOwnership(
      secondaryAccount.address
    );
    expect(await centralizedConsumablesDeposit.owner()).to.equal(
      secondaryAccount.address
    );
  });
});
*/
/*
describe("DonationsEscrow", async () => {
  let centralizedConsumablesDeposit: DonationsEscrow;
  let mockMHP: ERC20;
  let mockBHP: ERC20;
  let owner: Wallet;
  let secondaryAccount: Wallet;
  let treasury: Wallet;

  beforeEach(async () => {
    [owner, secondaryAccount, treasury] = waffle.provider.getWallets();
    const daiFactory = await ethers.getContractFactory("Material");
    mockMHP = (await daiFactory.deploy("mhp", "MHP")) as ERC20;
    mockBHP = (await daiFactory.deploy("bhp", "BHP")) as ERC20;
    await mockMHP.deployed();
    await mockBHP.deployed();

    centralizedConsumablesDeposit = (await deployContract(
      owner,
      ConsumablesDepositArtifact,
      [treasuryAddress]
    )) as CentralizedConsumablesDeposit;
    await centralizedConsumablesDeposit.deployed();
    await mockMHP.approve(centralizedConsumablesDeposit.address, 300);
  });

  it("Successful Deposit", async () => {
    const transaction = await centralizedConsumablesDeposit.deposit(
      10,
      mockMHP.address
    );
    transaction.wait();
    await expect(transaction)
      .to.emit(centralizedConsumablesDeposit, "Deposit")
      .withArgs(owner.address, 10, mockMHP.address);

    expect(await mockMHP.balanceOf(treasury.address)).to.eq(10);
  });

  it("Failed Deposit", async () => {
    await expect(
      centralizedConsumablesDeposit.deposit(500, mockMHP.address)
    ).to.revertedWith("ERC20: insufficient allowance");
  });

  it("Transfer Ownership", async () => {
    await centralizedConsumablesDeposit.transferOwnership(
      secondaryAccount.address
    );
    expect(await centralizedConsumablesDeposit.owner()).to.equal(
      secondaryAccount.address
    );
  });
});
*/

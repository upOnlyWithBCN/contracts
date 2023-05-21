import "@nomiclabs/hardhat-ethers";
import hre from "hardhat";
require("dotenv").config({ path: "./.env.local" });

const main = async () => {
  const DonationsEscrow = await hre.ethers.getContractFactory(
    "DonationsEscrow"
  );
  const DonationsEscrowFactory = await hre.ethers.getContractFactory(
    "DonationsEscrowFactory"
  );
  const donationsEscrow = await DonationsEscrow.deploy();
  const donationsEscrowFactory = await DonationsEscrowFactory.deploy(
    process.env.CURRENCY_ADDRESS
  ); // Need treasury address && usdc address
  await donationsEscrowFactory.deployed();
  console.log("Contract deployed to:", donationsEscrowFactory.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();

const hre = require("hardhat");

async function main() {
  // Get the contract to deploy
  const BuyMeACoffe = await hre.ethers.getContractFactory("BuyMeACoffe");
  // Deploy contract
  const buyMeACoffe = await BuyMeACoffe.deploy();
  // Await until deployed
  await buyMeACoffe.deployed();
  console.log("BuyMeACoffe deployed to ", buyMeACoffe.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

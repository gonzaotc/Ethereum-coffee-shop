// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

// HELPER FUNCTIONS

// Return the Ether balance of a given address
async function getBalance(address) {
  // waffle is an hardhat ethers implementation, and provider connect us with the blockchain that we set.
  // getBalance gets the balance of the address in the selected blockchain.
  const balanceBigInt = await hre.waffle.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

// Logs the Ether balances for a list of addresses
async function printBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(address));
    idx++;
  }
}

// Logs the memos stored on-chain from coffe purchases.
async function printMemos(memos) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    console.log(`At ${timestamp}, ${tipper} (${tipperAddress}) said: ${message}`);
  }
}

async function main() {
  //  Get example accounts
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

  // Get the contract to deploy
  const BuyMeACoffe = await hre.ethers.getContractFactory("BuyMeACoffe");
  // Deploy contract
  const buyMeACoffe = await BuyMeACoffe.deploy();
  // Await until deployed
  await buyMeACoffe.deployed();
  console.log("BuyMeACoffe deployed to ", buyMeACoffe.address);

  // Check balances before the coffe pucharse
  const addresses = [owner.address, tipper.address, buyMeACoffe.address];
  console.log("== START == ");
  await printBalances(addresses);

  // Buy the owner a few coffes
  const tip = { value: hre.ethers.utils.parseEther("1") };
  // buy me a coffe only has only two parameters, but in solidity function calls we can include an "options" object
  // that contains a value property, specifing the ammount of ether transacted.
  await buyMeACoffe.connect(tipper).buyCoffe("Sebastian", "Here is a your coffe gm", tip);
  await buyMeACoffe.connect(tipper2).buyCoffe("Pablito Hernandez", "This is not starbucks lol", tip);
  await buyMeACoffe.connect(tipper3).buyCoffe("Joshua", "I prefer tea..", tip);

  // Check balances after the coffe pucharse
  console.log("=== bought coffe ===")
  await printBalances(addresses)

  // Withdraw funds
  await buyMeACoffe.connect(owner).withdrawTips();

  // Check balance after withdraw
  console.log("=== withdrawTips ===");
  await printBalances(addresses);


  // Read all the memos left for the owner
  console.log(" == memos == ")
  const memos = await buyMeACoffe.getMemos()
  printMemos(memos)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

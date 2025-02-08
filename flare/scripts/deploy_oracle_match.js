const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Déploiement depuis :", deployer.address);

    const MatchOracle = await ethers.getContractFactory("MatchOracle");
    const oracle = await MatchOracle.deploy();
    await oracle.waitForDeployment();

    console.log("Oracle déployé à l'adresse :", await oracle.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
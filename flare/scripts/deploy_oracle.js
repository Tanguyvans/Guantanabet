const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Déploiement depuis : ${deployer.address}`);

    const WeatherOracle = await hre.ethers.getContractFactory("WeatherOracle");
    const weatherOracle = await WeatherOracle.deploy();

    await weatherOracle.waitForDeployment();

    console.log(`Oracle déployé à l'adresse : ${weatherOracle.target}`);

}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

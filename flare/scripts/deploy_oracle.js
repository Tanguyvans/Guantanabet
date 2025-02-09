const hre = require("hardhat");

async function main() {
    try {
        const [deployer] = await hre.ethers.getSigners();
        console.log(`🚀 Déploiement depuis l'adresse : ${deployer.address}`);

        // 📡 Chargement du contrat
        const WeatherOracle = await hre.ethers.getContractFactory("WeatherOracle");
        console.log("📡 Déploiement du contrat WeatherOracle...");

        // ✅ Déployer le contrat
        const weatherOracle = await WeatherOracle.deploy();
        await weatherOracle.waitForDeployment(); // ✅ CORRECTION : attendre le déploiement

        console.log(`✅ Oracle déployé avec succès à l'adresse : ${weatherOracle.target}`);
    } catch (error) {
        console.error(`❌ Erreur lors du déploiement :`, error.message);
        process.exit(1);
    }
}

// Exécution du script
main();

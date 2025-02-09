require("dotenv").config();
const { ethers } = require("ethers");

console.log("🚀 Récupération des données...");

// Charger les variables d'environnement
const CONTRACT_ADDRESS = process.env.WEATHER_CONTRACT;
const FLARE_RPC = "https://coston-api.flare.network/ext/bc/C/rpc";

// Connexion à la blockchain
const provider = new ethers.JsonRpcProvider(FLARE_RPC);
const abi = ["function getWeather() public view returns (int256, uint256)"];

async function main() {
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

        // ✅ Récupérer les valeurs stockées sur la blockchain
        let [temperature, lastUpdate] = await contract.getWeather();

        // ✅ Corriger l'opération avec BigInt
        temperature = temperature - BigInt(178);
        lastUpdate = lastUpdate - BigInt(178);

        console.log(`🌡️ Température : ${temperature}°C`);

        // ✅ Convertir `BigInt` en `Number` avant de multiplier par 1000
        const timestamp = Number(lastUpdate) * 1000;

        console.log(`⏳ Dernière mise à jour : ${new Date(timestamp).toLocaleString()}`);
    } catch (error) {
        console.error(`❌ Erreur :`, error.message);
    }
}

main().catch(console.error);

require("dotenv").config();
const axios = require("axios");
const { ethers } = require("hardhat");

console.log("🚀 Début du script update_weather.js");

// Charger les variables d'environnement
const API_KEY = process.env.OPENWEATHER_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.WEATHER_CONTRACT;
const CITY = "Mons";
const FLARE_RPC = "https://coston-api.flare.network/ext/bc/C/rpc";

console.log(`🔑 Clé API OpenWeather : ${API_KEY ? "OK" : "❌ MANQUANTE"}`);
console.log(`🔑 Clé privée : ${PRIVATE_KEY ? "OK" : "❌ MANQUANTE"}`);
console.log(`📍 Adresse du contrat : ${CONTRACT_ADDRESS ? CONTRACT_ADDRESS : "❌ MANQUANTE"}`);

const URL = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`;

async function main() {
    try {
        console.log("🌍 Connexion à OpenWeather...");
        const response = await axios.get(URL);
        const temperature = Math.round(response.data.main.temp);

        console.log(`🌡️ Température récupérée : ${temperature}°C`);

        console.log("🔗 Connexion à la blockchain Flare...");
        const provider = new ethers.JsonRpcProvider(FLARE_RPC);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const abi = [
            "function updateWeather(int256 temperature) public",
            "function getWeather() public view returns (int256, uint256)"
        ];
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

        console.log("📡 Envoi de la transaction...");
        const tx = await contract.updateWeather(temperature);
        await tx.wait();

        console.log(`✅ Température mise à jour sur la blockchain Flare !`);
    } catch (error) {
        console.error(`❌ Erreur rencontrée :`, error.message);
    }
}

main().catch(console.error);

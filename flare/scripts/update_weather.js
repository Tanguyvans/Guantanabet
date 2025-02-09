require("dotenv").config();
const axios = require("axios");
const { ethers } = require("ethers");

console.log("🚀 Début du script update_weather.js");

// Charger les variables d'environnement
const API_KEY = process.env.OPENWEATHER_API_KEY;
const CONTRACT_ADDRESS = process.env.WEATHER_CONTRACT;
const FLARE_RPC = "https://coston-api.flare.network/ext/bc/C/rpc";

const URL = `https://api.openweathermap.org/data/2.5/weather?q=Mons&appid=${API_KEY}&units=metric`;

async function main() {
    console.log(`🔑 Clé API OpenWeather chargée : ${process.env.OPENWEATHER_API_KEY}`);

    try {
        console.log("🌍 Connexion à OpenWeather...");
        const response = await axios.get(URL);
        let temperature = Math.round(response.data.main.temp);
        console.log(`🌡️ Température récupérée : ${temperature}°C`);

        // ✅ Ajouter 178 pour le "chiffrement"
        temperature += 178;

        console.log("🔗 Connexion à la blockchain Flare...");
        const provider = new ethers.JsonRpcProvider(FLARE_RPC);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const abi = ["function updateWeather(int256 temperature) public"];
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

        console.log("📡 Paramètres envoyés à la blockchain :");
        console.log("🌡️ Température stockée :", temperature);

        // 📡 Envoyer la température à la blockchain
        console.log("📡 Envoi des données...");
        const tx = await contract.updateWeather(temperature);

        await tx.wait();
        console.log(`✅ Température envoyée à la blockchain avec succès !`);
    } catch (error) {
        console.error(`❌ Erreur rencontrée :`, error.message);
    }
}

main().catch(console.error);

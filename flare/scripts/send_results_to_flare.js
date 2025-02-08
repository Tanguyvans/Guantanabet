require("dotenv").config();
const axios = require("axios");
const { ethers } = require("ethers");

// Récupération des variables d'environnement
const ODDS_API_KEY = process.env.ODDS_API_KEY;
const FLARE_RPC_URL = process.env.FLARE_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// ABI du smart contract (exemple)
const CONTRACT_ABI = [
    "function storeMatchResult(string memory team1, uint256 score1, string memory team2, uint256 score2) public"
];

// Fonction pour récupérer les matchs terminés
async function getCompletedMatches() {
    try {
        console.log("📡 Récupération des résultats des matchs...");
        const url = `https://api.the-odds-api.com/v4/sports/soccer_france_ligue_one/scores?apiKey=${ODDS_API_KEY}&daysFrom=3`;
        
        const response = await axios.get(url);
        const matches = response.data;

        const completedMatches = matches.filter(match => match.completed === true);

        if (completedMatches.length === 0) {
            console.log("❌ Aucun match terminé trouvé.");
            return [];
        }

        completedMatches.forEach(match => {
            console.log(`⚽ ${match.home_team} ${match.scores[0].score} - ${match.scores[1].score} ${match.away_team}`);
        });

        return completedMatches;
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des matchs :", error.message);
        return [];
    }
}

// Fonction pour envoyer les résultats sur la blockchain Flare
async function sendResultsToFlare(matches) {
    if (matches.length === 0) {
        console.log("⏭️ Aucune donnée à envoyer.");
        return;
    }

    // Initialiser le provider et le wallet
    const provider = new ethers.JsonRpcProvider(FLARE_RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

    for (let match of matches) {
        const { home_team, away_team, scores } = match;
        const score1 = scores[0].score;
        const score2 = scores[1].score;

        try {
            console.log(`📤 Envoi du match ${home_team} ${score1} - ${score2} ${away_team} sur Flare...`);
            const tx = await contract.storeMatchResult(home_team, score1, away_team, score2);
            await tx.wait();
            console.log(`✅ Transaction confirmée ! Match stocké sur Flare.`);
        } catch (error) {
            console.error(`❌ Erreur lors de l'envoi du match sur Flare :`, error.message);
        }
    }
}

// Exécution du script
(async () => {
    const matches = await getCompletedMatches();
    await sendResultsToFlare(matches);
})();

require("dotenv").config();
const axios = require("axios");
const { ethers } = require("ethers");

// Charger les variables d'environnement
const ODDS_API_KEY = process.env.ODDS_API_KEY;
const FLARE_RPC_URL = process.env.FLARE_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ORACLE_CONTRACT_ADDRESS = process.env.ORACLE_CONTRACT_ADDRESS;

// Vérification des variables essentielles
if (!FLARE_RPC_URL || !PRIVATE_KEY || !ORACLE_CONTRACT_ADDRESS) {
    console.error("❌ Erreur : Vérifiez que toutes les variables d'environnement sont bien définies dans `.env`.");
    process.exit(1);
}

// ABI de l'oracle
const ORACLE_ABI = [
    "function storeMatchResult(string homeTeam, uint256 homeScore, string awayTeam, uint256 awayScore) public"
];

// Fonction pour récupérer UN SEUL match terminé
async function getOneCompletedMatch() {
    try {
        console.log("📡 Récupération d'un seul match terminé...");
        const url = `https://api.the-odds-api.com/v4/sports/soccer_france_ligue_one/scores?apiKey=${ODDS_API_KEY}&daysFrom=3`;
        
        const response = await axios.get(url);
        const matches = response.data;

        // Trouver le premier match terminé
        const match = matches.find(match => match.completed === true);

        if (!match) {
            console.log("❌ Aucun match terminé trouvé.");
            return null;
        }

        console.log(`⚽ Match trouvé : ${match.home_team} ${match.scores[0].score} - ${match.scores[1].score} ${match.away_team}`);
        return match;
    } catch (error) {
        console.error("❌ Erreur lors de la récupération du match :", error.message);
        return null;
    }
}

// Fonction pour envoyer UN SEUL match à l’oracle
async function sendMatchToOracle(match) {
    if (!match) {
        console.log("⏭️ Aucun match à envoyer.");
        return;
    }

    try {
        // 🔥 Initialisation du provider sans ENS
        const provider = new ethers.JsonRpcProvider(FLARE_RPC_URL);

        // Vérification du réseau
        const network = await provider.getNetwork();
        console.log(`🔍 Connecté au réseau Flare (ChainID: ${network.chainId})`);

        // Initialisation du wallet
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        console.log(`✅ Wallet connecté avec succès : ${wallet.address}`);

        // Vérification du contrat
        const contract = new ethers.Contract(ORACLE_CONTRACT_ADDRESS, ORACLE_ABI, wallet);
        console.log(`✅ Connexion au smart contract Oracle réussie : ${ORACLE_CONTRACT_ADDRESS}`);

        // Récupération des données du match
        const { home_team, away_team, scores } = match;
        const score1 = scores[0].score;
        const score2 = scores[1].score;

        console.log(`📤 Envoi du match ${home_team} ${score1} - ${score2} ${away_team} à l’oracle...`);
        const tx = await contract.storeMatchResult(home_team, score1, away_team, score2);
        await tx.wait();
        console.log(`✅ Transaction confirmée ! Match stocké sur l'oracle.`);
        
    } catch (error) {
        console.error(`❌ Erreur lors de l'envoi du match sur l'oracle :`, error.message);
    }
}

// Exécution du script
(async () => {
    const match = await getOneCompletedMatch();
    await sendMatchToOracle(match);
})();

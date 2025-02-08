require("dotenv").config();
const { ethers } = require("ethers");

async function testContract() {
    const FLARE_RPC_URL = process.env.FLARE_RPC_URL;
    const ORACLE_CONTRACT_ADDRESS = process.env.ORACLE_CONTRACT_ADDRESS;
    
    // Vérifier que l'adresse est bien définie
    if (!ORACLE_CONTRACT_ADDRESS) {
        console.error("❌ Erreur : L'adresse du contrat n'est pas définie.");
        return;
    }

    const ORACLE_ABI = [
        "function getLatestMatch() public view returns (string memory, uint256, string memory, uint256, uint256)"
    ];

    const provider = new ethers.JsonRpcProvider(FLARE_RPC_URL, { chainId: 16, name: "flare-coston" });

    const contract = new ethers.Contract(ORACLE_CONTRACT_ADDRESS, ORACLE_ABI, provider);

    try {
        console.log("🔍 Test de connexion au contrat MatchOracle...");
        const result = await contract.getLatestMatch();
        console.log("✅ Dernier match stocké :", result);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération du match :", error.message);
    }
}

testContract();

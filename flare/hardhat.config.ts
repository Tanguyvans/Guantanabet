import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

// Charger les variables d'environnement
const { PRIVATE_KEY, FLARE_RPC_API_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    coston: {
      url: `https://coston-api.flare.network/ext/bc/C/rpc${FLARE_RPC_API_KEY ? `?x-apikey=${FLARE_RPC_API_KEY}` : ""}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 16
    },
    coston2: {
      url: `https://coston2-api.flare.network/ext/C/rpc${FLARE_RPC_API_KEY ? `?x-apikey=${FLARE_RPC_API_KEY}` : ""}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 114
    },
    flare: {
      url: `https://flare-api.flare.network/ext/C/rpc${FLARE_RPC_API_KEY ? `?x-apikey=${FLARE_RPC_API_KEY}` : ""}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 14
    }
  },
  paths: {
    sources: "./contracts/",
    tests: "./test/",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

export default config;

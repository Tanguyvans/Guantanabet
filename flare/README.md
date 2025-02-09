# **Weather Oracle on Flare 🌦️🔥**  
🔗 **A decentralized weather oracle deployed on the Flare blockchain, retrieving temperature data for Mons via the OpenWeather API.**

---

## **📌 Project Overview**  
This project implements a **Weather Oracle** on the **Flare blockchain** using **Hardhat**.  
The smart contract fetches the current temperature of **Mons** from **OpenWeather API**, applies a **security transformation (+178 before storing)**, and saves it on-chain.  

Users can then query the **oracle** to retrieve the **actual temperature by applying the inverse correction (-178)**.

---

## **📦 Dependencies & Setup**
### **1️⃣ Install Dependencies**  
Run the following command to install all required packages:  
```sh
npm install
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv ethers axios ts-node

Environment variables 
PRIVATE_KEY=0x...
OPENWEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY
WEATHER_CONTRACT=0x0f3737dcD0431b05a90042C2B8292cfa74c86829
FLARE_RPC_URL=https://coston-api.flare.network/ext/bc/C/rpc


Deploy smart contract 
npx hardhat clean
npx hardhat compile

Deploy weather oracle 
npx hardhat run scripts/deploy_oracle.js --network coston

Expected output
🚀 Deploying from address: 0xDFeDD1EFf6e4728Cb1008249b9445B3988F65A28
📡 Deploying WeatherOracle contract...
✅ Oracle successfully deployed at: 0xABCDEF123...

Note the contract address and update your .env file accordingly: WEATHER_CONTRACT=0xABCDEF1234567890...

Updating temperature
npx hardhat run scripts/update_weather.js --network coston
🚀 Starting update_weather.js
🌍 Connecting to OpenWeather...
🌡️ Retrieved temperature: 12°C
📡 Sending data...
✅ Temperature successfully stored on the blockchain!

Checking data (hardhat console)
npx hardhat console --network coston
🌡️ Stored Temperature: 190°C
📅 Last Update: Sun Feb 09 2025 15:00:00 GMT+0000 (UTC)


Verify contract on flarescan :
npx hardhat verify --network coston <CONTRACT_ADDRESS>

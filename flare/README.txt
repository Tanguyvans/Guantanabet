#Dépendances
npm install
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv ethers axios ts-node

#Compiler smart contract
npx hardhat clean
npx hardhat compile

#Déploiement de l'oracle sur flare (coston)
npx hardhat run scripts/deploy_oracle.js --network coston

=> Récupérer l'adresse donnée et la mettre dans .env : WEATHER_CONTRACT=0xABCDEF1234567890...

#Récupérer la température et l'envoyer sur la blockchain 
npx hardhat run scripts/update_weather.js --network coston

#Vérifier la température stockée sur la blockchain => Console Hardhat
npx hardhat console --network coston
let contract = await ethers.getContractAt("WeatherOracle", process.env.WEATHER_CONTRACT);
let [temp, timestamp] = await contract.getWeather();
console.log(`🌡️ Température enregistrée : ${temp.toString()}°C`);
console.log(`📅 Dernière mise à jour : ${new Date(timestamp.toNumber() * 1000)}`);




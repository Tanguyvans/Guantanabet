import { PredictionMarket } from './PredictionMarket.js';
import { Field, Mina, PrivateKey, AccountUpdate } from 'o1js';

const useProof = false;

const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const deployerAccount = Local.testAccounts[0];
const deployerKey = deployerAccount.key;
const senderAccount = Local.testAccounts[1];
const senderKey = senderAccount.key;

// ----------------------------------------------------

// Create a destination we will deploy the smart contract to
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

console.log('Deploying PredictionMarket...');
const zkApp = new PredictionMarket(zkAppAddress);

// First, deploy the contract
const deployTxn = await Mina.transaction(deployerAccount, async () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  await zkApp.deploy();
});
await deployTxn.prove();
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

console.log('Contract deployed successfully!');
console.log('Contract address:', zkAppAddress.toBase58());

// ----------------------------------------------------

// Create a new market
console.log('\nCreating a new market...');
const marketId = Field(1);
const endTime = Field(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

const createMarketTxn = await Mina.transaction(senderAccount, async () => {
  await zkApp.createMarket(marketId, endTime);
});
await createMarketTxn.prove();
await createMarketTxn.sign([senderKey]).send();

const marketsRoot = zkApp.marketsRoot.get();
console.log('Market created successfully!');
console.log('Market ID:', marketId.toString());
console.log('End Time:', endTime.toString());
console.log('Markets Root:', marketsRoot.toString());

// ----------------------------------------------------

// Print final state
console.log('\nFinal contract state:');
console.log('Markets Root:', zkApp.marketsRoot.get().toString());
'use client';
import Head from 'next/head';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import GradientBG from '../components/GradientBG.js';
import styles from '../styles/Home.module.css';
import heroMinaLogo from '../public/assets/hero-mina-logo.svg';
<<<<<<< HEAD
import arrowRightSmall from '../public/assets/arrow-right-small.svg';
import {fetchAccount, Mina, PublicKey} from "o1js";
import {Add} from "../../contracts/src/Add";
import {PredictionMarket} from "../../contracts/src/PredictionMarket";
import {Field} from "o1js";

// Update this with your deployed contract address
// const zkAppAddress = "B62qit3nGJUg311EMRCGjd5xUFNnAn1W7tLQ96jPmQXa1vm8gtYgWgp";
const zkAppAddress = "B62qoBAoZRt8SRUKTqKKooSJFL9g25bHoQein272UNQBy7HriDaAEWT";
=======
import { fetchAccount, Mina, PublicKey } from "o1js";
import { Add } from "../../contracts/src/Add";

const zkAppAddress = "B62qit3nGJUg311EMRCGjd5xUFNnAn1W7tLQ96jPmQXa1vm8gtYgWgp";
>>>>>>> 464d69d (Add match scores)

import './reactCOIServiceWorker';

export default function Home() {
  const zkApp = useRef<PredictionMarket>(new PredictionMarket(PublicKey.fromBase58(zkAppAddress)));
  const [marketsRoot, setMarketsRoot] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string>("");
  const [marketId, setMarketId] = useState<string>("");
  const [transactionLink, setTransactionLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // État du pari
  const [bet, setBet] = useState({
    name: "PSG vs Marseille",
    description: "Paris sur le vainqueur du match de Ligue 1",
    votes: { yes: 0, no: 0 }
  });

<<<<<<< HEAD
  // fetch the contract state when the page loads
  useEffect(() => {
    (async () => {
      try {
        Mina.setActiveInstance(Mina.Network('https://api.minascan.io/node/devnet/v1/graphql'));
        await fetchAccount({publicKey: zkAppAddress});
        const root = zkApp.current.marketsRoot.get();
        setMarketsRoot(root.toString());

        console.log("Compiling PredictionMarket contract...");
        await PredictionMarket.compile();
=======
  useEffect(() => {
    (async () => {
      Mina.setActiveInstance(Mina.Network('https://api.minascan.io/node/devnet/v1/graphql'));
      await fetchAccount({ publicKey: zkAppAddress });
      const num = zkApp.current.num.get();
      setContractState(num.toString());

      console.log("Compiling Add contract to generate proving and verification keys");
      await Add.compile();
>>>>>>> 464d69d (Add match scores)

        setLoading(false);
      } catch (e) {
        console.error(e);
        setError("Failed to load contract state");
        setLoading(false);
      }
    })();
  }, []);

<<<<<<< HEAD
  const createMarket = useCallback(async () => {
    setTransactionLink(null);
    setLoading(true);
    setError(null);

    try {
      const mina = (window as any).mina;
      const walletKey: string = (await mina.requestAccounts())[0];
      console.log("Connected wallet address: " + walletKey);
      await fetchAccount({publicKey: PublicKey.fromBase58(walletKey)});

      const transaction = await Mina.transaction(async () => {
        console.log("Creating new market...");
        await zkApp.current.createMarket(
          Field(marketId),
          Field(endTime)
        );
      });

      console.log("Proving transaction...");
      await transaction.prove();

      console.log("Sending transaction...");
      const {hash} = await mina.sendTransaction({
        transaction: transaction.toJSON(),
      });

      const transactionLink = "https://minascan.io/devnet/tx/" + hash;
      setTransactionLink(transactionLink);
      
      // Refresh the markets root after creation
      const newRoot = zkApp.current.marketsRoot.get();
      setMarketsRoot(newRoot.toString());
    } catch (e: any) {
      console.error(e);
      setError(handleError(e));
    } finally {
      setLoading(false);
    }
  }, [marketId, endTime]);

  const handleError = (e: any): string => {
    if (e.message.includes("Cannot read properties of undefined (reading 'requestAccounts')")) {
      return "Is Auro wallet installed?";
    } else if (e.message.includes("Please create or restore wallet first.")) {
      return "Please create a wallet first";
    } else if (e.message.includes("User rejected the request.")) {
      return "Please grant permission to connect";
    }
    return "An unknown error occurred";
=======
  // Fonction pour connecter le wallet Mina (Auro Wallet)
  const connectWallet = async () => {
    try {
      const mina = (window as any).mina;
      if (!mina) {
        alert("Auro Wallet n'est pas installé !");
        return;
      }

      const accounts: string[] = await mina.requestAccounts();
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]); // Stocke l'adresse du wallet
        console.log("Wallet connecté :", accounts[0]);
      } else {
        alert("Aucune adresse de wallet trouvée.");
      }
    } catch (error) {
      console.error("Erreur de connexion au wallet :", error);
      alert("Erreur lors de la connexion au wallet.");
    }
  };

  // Fonction pour voter
  const handleVote = (choice: "yes" | "no") => {
    setBet(prevBet => ({
      ...prevBet,
      votes: { ...prevBet.votes, [choice]: prevBet.votes[choice] + 1 }
    }));
>>>>>>> 464d69d (Add match scores)
  };

  return (
    <>
      <Head>
<<<<<<< HEAD
        <title>Prediction Market zkApp</title>
        <meta name="description" content="Prediction Market built with o1js"/>
        <link rel="icon" href="/assets/favicon.ico"/>
=======
        <title>Mina zkApp UI</title>
        <meta name="description" content="built with o1js" />
        <link rel="icon" href="/assets/favicon.ico" />
>>>>>>> 464d69d (Add match scores)
      </Head>
      <GradientBG>
        {/* Navbar */}
        <nav className={styles.navbar}>
          <div className={styles.navTitle}>Mina zkApp</div>
          <div className={styles.navRight}>
            {walletAddress ? (
              <div className={styles.walletText}>🔗 {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</div>
            ) : (
              <button className={styles.walletButton} onClick={connectWallet}>🔗 Connecter mon wallet</button>
            )}
          </div>
        </nav>

        <main className={styles.main}>
          <div className={styles.center}>
            <a href="https://minaprotocol.com/" target="_blank" rel="noopener noreferrer">
              <Image className={styles.logo} src={heroMinaLogo} alt="Mina Logo" width="191" height="174" priority />
            </a>
            <p className={styles.tagline}>
              built with <code className={styles.code}> o1js</code>
            </p>
          </div>

          <p className={styles.start}>
            Get started by editing <code className={styles.code}> app/page.tsx</code>
          </p>

          {/* Card Contract State avec un pari */}
          <div className={styles.state}>
            <div>
<<<<<<< HEAD
              <div>Markets Root: <span className={styles.bold}>{marketsRoot}</span></div>
              
              <div className={styles.form}>
                <input
                  type="text"
                  placeholder="Market ID"
                  value={marketId}
                  onChange={(e) => setMarketId(e.target.value)}
                  className={styles.input}
                />
                <input
                  type="text"
                  placeholder="End Time (Unix timestamp)"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={styles.input}
                />
                {error ? (
                  <span className={styles.error}>Error: {error}</span>
                ) : loading ? (
                  <div>Loading...</div>
                ) : transactionLink ? (
                  <a href={transactionLink} className={styles.bold} target="_blank" rel="noopener noreferrer">
                    View Transaction on MinaScan
                  </a>
                ) : (
                  <button onClick={createMarket} className={styles.button}>
                    Create Market
                  </button>
                )}
=======
              <h3>{bet.name}</h3>
              <p>{bet.description}</p>
              <div className={styles.voteContainer}>
                <button className={styles.voteButton} onClick={() => handleVote("yes")}>✅ Yes ({bet.votes.yes})</button>
                <button className={styles.voteButton} onClick={() => handleVote("no")}>❌ No ({bet.votes.no})</button>
>>>>>>> 464d69d (Add match scores)
              </div>
            </div>
          </div>

        </main>
      </GradientBG>
    </>
  );
}

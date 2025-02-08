'use client';
import Head from 'next/head';
import Image from 'next/image';
import {useCallback, useEffect, useRef, useState} from 'react';
import GradientBG from '../components/GradientBG.js';
import styles from '../styles/Home.module.css';
import heroMinaLogo from '../public/assets/hero-mina-logo.svg';
import arrowRightSmall from '../public/assets/arrow-right-small.svg';
import {fetchAccount, Mina, PublicKey} from "o1js";
import {Add} from "../../contracts/src/Add";
import {PredictionMarket} from "../../contracts/src/PredictionMarket";
import {Field} from "o1js";

// Update this with your deployed contract address
// const zkAppAddress = "B62qit3nGJUg311EMRCGjd5xUFNnAn1W7tLQ96jPmQXa1vm8gtYgWgp";
const zkAppAddress = "B62qoBAoZRt8SRUKTqKKooSJFL9g25bHoQein272UNQBy7HriDaAEWT";

import './reactCOIServiceWorker';

export default function Home() {
  const zkApp = useRef<PredictionMarket>(new PredictionMarket(PublicKey.fromBase58(zkAppAddress)));
  const [marketsRoot, setMarketsRoot] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string>("");
  const [marketId, setMarketId] = useState<string>("");
  const [transactionLink, setTransactionLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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

        setLoading(false);
      } catch (e) {
        console.error(e);
        setError("Failed to load contract state");
        setLoading(false);
      }
    })();
  }, []);

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
  };

  return (
    <>
      <Head>
        <title>Prediction Market zkApp</title>
        <meta name="description" content="Prediction Market built with o1js"/>
        <link rel="icon" href="/assets/favicon.ico"/>
      </Head>
      <GradientBG>
        <main className={styles.main}>
          <div className={styles.center}>
            <a
              href="https://minaprotocol.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className={styles.logo}
                src={heroMinaLogo}
                alt="Mina Logo"
                width="191"
                height="174"
                priority
              />
            </a>
            <p className={styles.tagline}>
              built with
              <code className={styles.code}> o1js</code>
            </p>
          </div>
          <p className={styles.start}>
            Get started by editing
            <code className={styles.code}> app/page.tsx</code>
          </p>
          <div className={styles.state}>
            <div>
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
              </div>
            </div>
          </div>
          <div className={styles.grid}>
            <a
              href="https://docs.minaprotocol.com/zkapps"
              className={styles.card}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h2>
                <span>DOCS</span>
                <div>
                  <Image
                    src={arrowRightSmall}
                    alt="Mina Logo"
                    width={16}
                    height={16}
                    priority
                  />
                </div>
              </h2>
              <p>Explore zkApps, how to build one, and in-depth references</p>
            </a>
            <a
              href="https://docs.minaprotocol.com/zkapps/tutorials/hello-world"
              className={styles.card}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h2>
                <span>TUTORIALS</span>
                <div>
                  <Image
                    src={arrowRightSmall}
                    alt="Mina Logo"
                    width={16}
                    height={16}
                    priority
                  />
                </div>
              </h2>
              <p>Learn with step-by-step o1js tutorials</p>
            </a>
            <a
              href="https://discord.gg/minaprotocol"
              className={styles.card}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h2>
                <span>QUESTIONS</span>
                <div>
                  <Image
                    src={arrowRightSmall}
                    alt="Mina Logo"
                    width={16}
                    height={16}
                    priority
                  />
                </div>
              </h2>
              <p>Ask questions on our Discord server</p>
            </a>
            <a
              href="https://docs.minaprotocol.com/zkapps/how-to-deploy-a-zkapp"
              className={styles.card}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h2>
                <span>DEPLOY</span>
                <div>
                  <Image
                    src={arrowRightSmall}
                    alt="Mina Logo"
                    width={16}
                    height={16}
                    priority
                  />
                </div>
              </h2>
              <p>Deploy a zkApp to Testnet</p>
            </a>
          </div>
        </main>
      </GradientBG>
    </>
  );
}

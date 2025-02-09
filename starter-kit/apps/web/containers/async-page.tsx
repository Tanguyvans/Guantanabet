"use client";
import { Faucet } from "@/components/faucet";
import { useFaucet } from "@/lib/stores/balances";
import { usePredictionMarketStore } from "@/lib/stores/PredictionMarket";
import { useWalletStore } from "@/lib/stores/wallet";
import { PredictionMarket } from "chain/dist/runtime/modules/PredictionMarket";
import { useState } from "react";

export default function Home() {
  const wallet = useWalletStore();
  const predictionMarket = usePredictionMarketStore();
  const [marketId, setMarketId] = useState<string | null>(null);

  const drip = useFaucet();

  return (
    <div className="mx-auto -mt-32 h-full pt-16">
      <div className="flex h-full w-full items-center justify-center pt-16">
        <div className="flex basis-4/12 flex-col items-center justify-center 2xl:basis-3/12">

          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold">Prediction Market</h1>
            <div className="flex flex-col items-center justify-center">
              <div>{wallet.wallet}</div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold">Prediction Market</h1>
            <div className="flex flex-col items-center justify-center">
              <button 
                onClick={async () => {
                  try {
                    console.log("Creating market...");
                    if (!wallet.wallet) {
                      alert("Please connect your wallet first");
                      return;
                    }

                    // After blockchain transaction, update local state
                    let newid = await predictionMarket.createMarket({
                      description: "Will the price of BTC be higher than $50,000 on 2025-03-01?",
                      betType: "Long",
                      endingTimestamp: 1714531200,
                      startingTimestamp: Date.now(),
                      minimumStakeAmount: 1000000000,
                      totalStake: 0,
                      yesPercentage: 50,
                      noPercentage: 50,
                      creator: wallet.wallet,
                      isResolved: false
                    });

                    console.log(newid);

                    setMarketId(newid);

                    console.log("Market created successfully");

                  } catch (error) {
                    console.error("Failed to create prediction market:", error);
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                Create Market
              </button>

              <button
                onClick={async () => {
                  try {
                    console.log("Creating market...");
                    if (!wallet.wallet) {
                      alert("Please connect your wallet first");
                      return;
                    }

                    // After blockchain transaction, update local state
                    let otherid = await predictionMarket.createShortBetOnLongBet(marketId,
                        {
                      endingTimestamp: 1714531200,
                      startingTimestamp: Date.now(),
                      minimumStakeAmount: 1000000000,
                      totalStake: 0,
                      yesPercentage: 50,
                      noPercentage: 50,
                      creator: wallet.wallet,
                      isResolved: false
                    });

                    console.log(otherid);

                    setMarketId(otherid);

                    console.log("Short Market created successfully");

                  } catch (error) {
                    console.error("Failed to create prediction market:", error);
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                Create short Market on long
              </button>

              <button
                onClick={async () => {
                    try {
                      console.log("Getting all markets...");
                        if (!wallet.wallet) {
                            alert("Please connect your wallet first");
                            return;
                        }

                        // After blockchain transaction, update local state
                        let markets = await predictionMarket.getAllMarkets();
                        console.log(markets);

                    } catch (error) {
                        console.error("Failed to create prediction market:", error);
                    }
                }
                }
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                Get All Markets
              </button>

            </div>
          </div>

          <div>
            <h1>Market</h1>
            {marketId ? predictionMarket.getMarket(marketId)?.description : null}
          </div>

          <Faucet
            wallet={wallet.wallet}
            onConnectWallet={wallet.connectWallet}
            onDrip={drip}
            loading={false}
          />
        </div>
      </div>
    </div>
  );
}

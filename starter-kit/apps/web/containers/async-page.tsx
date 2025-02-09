"use client";
import { Faucet } from "@/components/faucet";
import { useFaucet } from "@/lib/stores/balances";
import { usePredictionMarketStore } from "@/lib/stores/PredictionMarket";
import { useWalletStore } from "@/lib/stores/wallet";
import { PredictionMarket } from "chain/dist/runtime/modules/PredictionMarket";
import { useEffect, useState } from "react";

export default function Home() {
  const wallet = useWalletStore();
  const predictionMarket = usePredictionMarketStore();
  const [marketId, setMarketId] = useState<string | null>(null);
  const [allMarkets, setAllMarkets] = useState<PredictionMarket[]>([]);
  const drip = useFaucet();

  // Ajouter l'état du formulaire
  const [marketForm, setMarketForm] = useState({
    description: "",
    endingTimestamp: "",
    minimumStakeAmount: ""
  });

  // Ajouter le gestionnaire de changement
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMarketForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header avec effet glassmorphism */}
        <div className="mb-12 text-center backdrop-blur-lg bg-white/10 p-8 rounded-2xl shadow-xl">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            Prediction Market Platform
          </h1>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <div className="inline-block px-6 py-3 bg-gray-800/50 rounded-xl border border-gray-700">
              <p className="text-gray-300">
                Connected Wallet: 
                <span className="ml-2 font-mono text-blue-400">
                  {wallet.wallet || "Not Connected"}
                </span>
              </p>
            </div>
            <button
              onClick={async () => {
                try {
                  console.log("Refreshing markets...");
                  const updatedMarkets = await predictionMarket.getAllMarkets();
                  setAllMarkets(updatedMarkets);
                  console.log("Markets refreshed successfully");
                } catch (error) {
                  console.error("Failed to refresh markets:", error);
                  alert("Failed to refresh markets");
                }
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition duration-200 shadow-lg hover:shadow-blue-500/25"
            >
              Refresh Markets
            </button>
          </div>
        </div>

        {/* Formulaire de création avec design moderne */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">Create New Market</h2>
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Description</label>
                <input
                  type="text"
                  name="description"
                  value={marketForm.description}
                  onChange={handleInputChange}
                  placeholder="Ex: Will BTC reach $100k by end of 2024?"
                  className="w-full p-3 rounded-xl bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Ending Date</label>
                <input
                  type="datetime-local"
                  name="endingTimestamp"
                  value={marketForm.endingTimestamp}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Minimum Stake Amount</label>
                <input
                  type="number"
                  name="minimumStakeAmount"
                  value={marketForm.minimumStakeAmount}
                  onChange={handleInputChange}
                  placeholder="1000000000"
                  className="w-full p-3 rounded-xl bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Garder les onClick existants */}
              <div className="grid grid-cols-2 gap-4 pt-4">
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
                        description: marketForm.description,
                        betType: "Long",
                        endingTimestamp: marketForm.endingTimestamp,
                        startingTimestamp: Date.now(),
                        minimumStakeAmount: marketForm.minimumStakeAmount,
                        totalStake: 0,
                        yesPercentage: 50,
                        noPercentage: 50,
                        creator: wallet.wallet,
                        isResolved: false
                      });
                      setMarketId(newid);

                      console.log("Market created successfully");

                    } catch (error) {
                      console.error("Failed to create prediction market:", error);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-blue-500/25"
                >
                  Create Long Market
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
                      let otherid = await predictionMarket.createShortBetOnLongBet(marketId, {
                        endingTimestamp: marketForm.endingTimestamp,
                        startingTimestamp: Date.now(),
                        minimumStakeAmount: marketForm.minimumStakeAmount,
                        totalStake: 0,
                        yesPercentage: 50,
                        noPercentage: 50,
                        creator: wallet.wallet,
                        isResolved: false
                      });

                      console.log(otherid);

                      //setMarketId(otherid);

                      console.log("Short Market created successfully");

                    } catch (error) {
                      console.error("Failed to create prediction market:", error);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-purple-500/25"
                >
                  Create Short Market
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Liste des marchés avec design moderne */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-blue-400">Active Markets</h2>
          <div className="space-y-4">
            {allMarkets && allMarkets.length > 0 ? (
              allMarkets.map((market, index) => {
                const currentTime = Date.now();
                return (
                  <div key={market.id} 
                    className="bg-gray-700/50 backdrop-blur-sm rounded-xl p-6 hover:bg-gray-600/50 transition-all duration-200 border border-gray-600 hover:border-gray-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm">
                            #{index + 1}
                          </span>
                          <h3 className="text-lg font-semibold">{market.description}</h3>
                        </div>
                        {market.linkedBetId && (
                          <p className="text-sm text-blue-400 mt-1">
                            Linked to market: {allMarkets.findIndex(m => m.id === market.linkedBetId) + 1}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {/* Garder les onClick existants */}
                        {market.betType === "Long" && !market.isResolved && (
                          <button
                            onClick={async () => {
                              try {
                                console.log("Creating short market...");
                                if (!wallet.wallet) {
                                  alert("Please connect your wallet first");
                                  return;
                                }

                                // After blockchain transaction, update local state
                                let otherid = await predictionMarket.createShortBetOnLongBet(marketId, {
                                  endingTimestamp: market.endingTimestamp,
                                  startingTimestamp: Date.now(),
                                  minimumStakeAmount: market.minimumStakeAmount,
                                  totalStake: 0,
                                  yesPercentage: 50,
                                  noPercentage: 50,
                                  creator: wallet.wallet,
                                  isResolved: false
                                });

                                console.log(otherid);

                                //setMarketId(otherid);

                                console.log("Short Market created successfully");

                              } catch (error) {
                                console.error("Failed to create prediction market:", error);
                              }
                            }}
                            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                          >
                            Create Short
                          </button>
                        )}
                        {!market.isResolved && (
                          <button
                            onClick={async () => {
                              console.log("Resolving market...");
                              await predictionMarket.resolveMarket(marketId, 25, Date.now(), wallet.wallet, wallet.wallet);
                              console.log("Market resolved successfully");
                            }}
                            className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-yellow-500/25"
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            try {
                              console.log("Placing Yes bet...");
                              if (!wallet.wallet) {
                                alert("Please connect your wallet first");
                                return;
                              }

                              await predictionMarket.placeBet(marketId, true, market.minimumStakeAmount);
                              console.log("Yes bet placed successfully");

                            } catch (error) {
                              console.error("Failed to place Yes bet:", error);
                            }
                          }}
                          disabled={currentTime > market.endingTimestamp || market.isResolved}
                          className={`
                            ${currentTime > market.endingTimestamp || market.isResolved 
                              ? 'bg-gray-500 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'} 
                            text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/25`}
                        >
                          Place Bet
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-sm mb-2">Yes: {market.yesPercentage}%</p>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${market.yesPercentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-sm mb-2">No: {market.noPercentage}%</p>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-red-400 to-red-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${market.noPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {market.isResolved && (
                      <div className="mt-4 bg-gray-800/50 rounded-lg p-3">
                        <p className="text-sm font-semibold flex items-center gap-2">
                          Result: 
                          <span className={`px-3 py-1 rounded-full ${
                            market.outcome ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                          }`}>
                            {market.outcome ? "Yes" : "No"}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-lg">No markets available</p>
                <p className="text-sm mt-2">Create a new market to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { PublicKey, Field, UInt64, CircuitString, Signature } from 'o1js';
import { create } from 'zustand';
import {useWalletStore} from "@/lib/stores/wallet";
import {useClientStore} from "@/lib/stores/client";
import {tokenId} from "@/lib/stores/balances";
import {Balance} from "@proto-kit/library";
import {client} from "chain";

export interface PredictionMarket {
  id: string;
  betType: string;
  linkedBetId?: string;
  description: string;
  endingTimestamp: number;
  startingTimestamp: number;
  minimumStakeAmount: number;
  totalStake: number;
  yesPercentage: number;
  noPercentage: number;
  creator: string;
  isResolved: boolean;
  outcome?: boolean;
}

interface PredictionMarketState {
  markets: PredictionMarket[];
  currentMarket: PredictionMarket | null;
  isLoading: boolean;
  error: string | null;
  smartContract: any;
  // Actions
  createMarket: (market: Omit<PredictionMarket, 'id'>) => Promise<void>;
  createShortBetOnLongBet: (id: string, market: Omit<PredictionMarket, 'id'>) => Promise<void>;
  placeBet: (marketId: string, isYes: boolean, amount: number) => Promise<void>;
  resolveMarket: (marketId: string, temperature: Field, timestamp: Field, signature: Signature, oraclePublicKey: PublicKey) => Promise<void>;
  setCurrentMarket: (market: PredictionMarket | null) => void;
  fetchMarkets: () => Promise<void>;
  getMarket: (id: string) => PredictionMarket | null;
  getAllMarkets: () => PredictionMarket[];
}

export const usePredictionMarketStore = create<PredictionMarketState>((set, get) => ({
  markets: [],
  currentMarket: null,
  isLoading: false,
  error: null,
  smartContract: client.runtime.resolve("PredictionMarket"),

  createMarket: async (market) => {
    try {
      set({ isLoading: true, error: null });
      
      // Generate unique ID
      const id = Date.now().toString();
      
      const newMarket: PredictionMarket = {
        ...market,
        id,
        totalStake: 0,
        yesPercentage: 50,
        noPercentage: 50,
        isResolved: false
      };

      // Get existing markets from localStorage
      const existingMarkets = localStorage.getItem('predictionMarkets');
      const markets = existingMarkets ? JSON.parse(existingMarkets) : [];
      
      // Add new market
      const updatedMarkets = [...markets, newMarket];
      
      // Save to localStorage
      localStorage.setItem('predictionMarkets', JSON.stringify(updatedMarkets));
      
      set((state) => ({
        markets: [...state.markets, newMarket],
        isLoading: false
      }));

      // Create a transaction to create the market
      const sender = PublicKey.fromBase58(newMarket.creator);
        const tx = await client.transaction(sender, async () => {
            await get().smartContract.test();
        });
      console.log("Transaction : ", tx);
      await tx.sign();
      await tx.send();


        if (!tx) {
            throw new Error('Failed to create market');
        }

      return id;
    } catch (error) {
      set({ error: 'Failed to create market', isLoading: false });
      throw error;
    }
  },

  placeBet: async (marketId, isYes, amount) => {
    try {
      set({ isLoading: true, error: null });

      // get the user wallet
      const wallet = useWalletStore.getState();
      if (!wallet.wallet) {
        throw new Error('Please connect your wallet first');
      }

      // Update the market state
      const updatedMarkets = get().markets.map(market => {
        if (market.id === marketId) {
          const adjustment = Math.min(5, amount / 100);
          const newYesPercent = isYes
              ? market.yesPercentage + adjustment
              : market.yesPercentage - adjustment;

          return {
            ...market,
            yesPercentage: Math.max(0, Math.min(100, newYesPercent)),
            noPercentage: Math.max(0, Math.min(100, 100 - newYesPercent)),
            totalStake: market.totalStake + amount
          };
        }
        return market;
      });

      // Save to localStorage
      localStorage.setItem('predictionMarkets', JSON.stringify(updatedMarkets));

      console.log("Wallet : ", wallet.wallet);

      // Create a transaction to send money to the smart contract
      const tx = await get().smartContract.placeBet(
          PublicKey.fromBase58(wallet.wallet),
          UInt64.from(Number(amount)),
          CircuitString.fromString(marketId),
          isYes,
          tokenId
      );

      // Sign and send the transaction
      await tx.sign();
      await tx.send();


      set({ markets: updatedMarkets, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to place bet', isLoading: false });
      throw error;
    }
  },

  resolveMarket: async (marketId, temperature, timestamp, signature, oraclePublicKey) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedMarkets = get().markets.map(market => {
        if (market.id === marketId) {
          return {
            ...market,
            isResolved: true,
            temperature,
            timestamp,
            signature,
            oraclePublicKey
          };
        }
        return market;
      });

      // Save to localStorage
      localStorage.setItem('predictionMarkets', JSON.stringify(updatedMarkets));
      
      set({ markets: updatedMarkets, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to resolve market', isLoading: false });
      throw error;
    }
  },

  setCurrentMarket: (market) => {
    set({ currentMarket: market });
  },

  fetchMarkets: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Get markets from localStorage
      const savedMarkets = localStorage.getItem('predictionMarkets');
      const markets = savedMarkets ? JSON.parse(savedMarkets) : [];
      
      set({ markets, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch markets', isLoading: false });
      throw error;
    }
  },

  getMarket: (id) => {
    return get().markets.find(market => market.id === id) || null;
  },

  getAllMarkets: () => {
    const existingMarkets = localStorage.getItem('predictionMarkets');
    return existingMarkets ? JSON.parse(existingMarkets) : [];
  },

  createShortBetOnLongBet: async (id, market) => {
    try {
      set({ isLoading: true, error: null });

      // Get existing markets from localStorage
        const existingMarkets = localStorage.getItem('predictionMarkets');
        const markets = existingMarkets ? JSON.parse(existingMarkets) : [];

      // check if there is another short market linked to the long market
        const shortMarket = get().markets.find(market => market.linkedBetId === id);
        if (shortMarket) {
            throw new Error('Short market already exists');
        }

      // check if market exists
        const longMarket = get().markets.find(market => market.id === id);
        if (longMarket && longMarket.betType === 'Long') {
          // create short market
          const shortMarket = {
            betType: 'Short',
            linkedBetId: id,
            endingTimestamp: market.endingTimestamp,
            startingTimestamp: market.startingTimestamp,
            minimumStakeAmount: market.minimumStakeAmount,
            description: "Will it be more Yes or No ?",
            creator: market.creator
          };

          return await get().createMarket(shortMarket);
        }
    } catch (error) {
      set({ error: 'Failed to create market', isLoading: false });
      throw error;
    }
  }
}));

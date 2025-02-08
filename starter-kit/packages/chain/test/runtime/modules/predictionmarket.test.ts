import "reflect-metadata";
import { TestingAppChain } from "@proto-kit/sdk";
import { method, PrivateKey, CircuitString, Bool } from "o1js";
import { PredictionMarket } from "../../../src/runtime/modules/PredictionMarket";
import { Balances } from "../../../src/runtime/modules/balances";
import { log } from "@proto-kit/common";
import { UInt64 } from "@proto-kit/library";

log.setLevel("ERROR");

describe("prediction market", () => {
  it("should create and place bets", async () => {
    const appChain = TestingAppChain.fromRuntime({
      PredictionMarket,
      Balances, // Required since PredictionMarket depends on it
    });

    appChain.configurePartial({
      Runtime: {
        Balances: {
          totalSupply: UInt64.from(10000),
        },
      },
    });

    await appChain.start();

    const alicePrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();

    appChain.setSigner(alicePrivateKey);

    const predictionMarket = appChain.runtime.resolve("PredictionMarket");

    // Create a new bet
    const tx1 = await appChain.transaction(alice, async () => {
      const endTime = UInt64.from(Date.now() + 3600000); // 1 hour from now
      const description = CircuitString.fromString("Will it rain tomorrow?");
      await predictionMarket.createBet(endTime, description);
    });

    await tx1.sign();
    await tx1.send();

    const block1 = await appChain.produceBlock();
    expect(block1?.transactions[0].status.toBoolean()).toBe(true);

    // Place a bet
    const tx2 = await appChain.transaction(alice, async () => {
      await predictionMarket.placeBet(
        UInt64.from(1), // First bet has ID 1
        Bool(true),     // Betting "Yes"
        UInt64.from(100) // Betting 100 tokens
      );
    });

    await tx2.sign();
    await tx2.send();

    const block2 = await appChain.produceBlock();
    expect(block2?.transactions[0].status.toBoolean()).toBe(true);

    // Query the bet details
    const bet = await appChain.query.runtime.PredictionMarket.getBetById(UInt64.from(1));
    
    expect(bet?.numberOfYesBets.toBigInt()).toBe(100n);
    expect(bet?.numberOfNoBets.toBigInt()).toBe(0n);
    expect(bet?.isResolved.toBoolean()).toBe(false);
  }, 1_000_000);
});
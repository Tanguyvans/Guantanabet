// Query the bet details
const bet = await appChain.query.runtime.PredictionMarket.getBetById(UInt64.from(1));

expect(bet?.yesPool.toBigInt()).toBe(100n);
expect(bet?.totalPool.toBigInt()).toBe(100n);
expect(bet?.resolved.toBigInt()).toBe(0n); 
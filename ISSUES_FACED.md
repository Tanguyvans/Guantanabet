## Protokit

### First Issue

In the starter-kit folder, we had to run the following command to create the chain:

```
npx degit proto-kit/starter-kit#develop my-chain
```

We had a problem with the apps/web/package.json file.

The fix was to change the version of the protokit packages to the following:

```json
  "peerDependencies": {
    "@proto-kit/api": "0.1.1-develop.1088",
    "@proto-kit/common": "0.1.1-develop.1088",
    "@proto-kit/deployment": "0.1.1-develop.1088",
    "@proto-kit/library": "0.1.1-develop.1088",
    "@proto-kit/module": "0.1.1-develop.1088",
    "@proto-kit/persistance": "0.1.1-develop.1088",
    "@proto-kit/protocol": "0.1.1-develop.1088",
    "@proto-kit/sdk": "0.1.1-develop.1088",
    "@proto-kit/sequencer": "0.1.1-develop.1088",
    "@proto-kit/indexer": "0.1.1-develop.1088",
    "o1js": "1.6.0",
    "tsyringe": "^4.7.0"
  }
```

### Second Issue

This repo doesn't have the frontend linked to the contract: https://github.com/codekaya/

### Third Issue
Typescript doesn't raise exceptions when you call the backend allowing you some operation that should not be allowed.
And some errors will be raised when you use a ```Promise.if``` for instance.

This is the code in the backend
```typescript
@runtimeMethod()
  public async placeBet(inputBetId: UInt64, outcome: Bool, amount: UInt64) {
    Provable.log("SM betId : ", inputBetId); // Thoses logs are displayed in the console like JS/TS variable
    Provable.log("SM outcome : ", outcome);
    Provable.log("SM amount : ", amount);

    let betId = UInt64.from(0);
    let amountBet = UInt64.from(amount);

    let stakedIds = new StakedId({
      betId: betId,
      publicKey: this.transaction.sender.value,
    });

    Provable.log(betId);

    let bet = await this.totalBets.get(betId);
    let theBet = bet.value;

    const stakedToYes = (await this.stakedToYes.get(stakedIds)).orElse(
      UInt64.zero,
    );
    Provable.log("Staked to yes: ", stakedToYes);

    let summup = UInt64.from(stakedToYes.add(amountBet));
    Provable.log("Summup for yes: ", summup);

    // Only here the error is raised
    let stakedToYesNew = Provable.if<UInt64>(
      outcome,
      UInt64,
      summup,
      stakedToYes,
    );

    // let stakedToYesNew = Provable.switch([outcome], Field, [summup]);
    Provable.log("Staked to yes new: ", stakedToYesNew);
```

In the frontend the contract was called like this:
```typescript
// Create a transaction to create the market
      const sender = PublicKey.fromBase58(wallet.wallet);
      const tx = await client.transaction(sender, async () => {
        await get().smartContract.placeBet(
            0,
            true, 
            1000
        );
      });
      console.log("Transaction : ", tx);
      await tx.sign();
      await tx.send();
```
So you should specify the type of the parameters in the frontend like this, to solve the issue:
```typescript
// Create a transaction to create the market
      const sender = PublicKey.fromBase58(wallet.wallet);
      const tx = await client.transaction(sender, async () => {
        await get().smartContract.placeBet(
            UInt64.zero,
            Bool(true),
            UInt64.from(1000)
        );
      });
      console.log("Transaction : ", tx);
      await tx.sign();
      await tx.send();
```

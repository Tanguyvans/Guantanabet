import { TokenId, UInt64 } from "@proto-kit/library";
import {
  runtimeMethod,
  runtimeModule,
  RuntimeModule,
  state,
} from "@proto-kit/module";
import { assert, State, StateMap } from "@proto-kit/protocol";
import {
  Bool,
  CircuitString,
  Field,
  Provable,
  PublicKey,
  Signature,
  Struct,
} from "o1js";
import { inject } from "tsyringe";
import { Balances } from "./balances";

export class Bets extends Struct({
  betId: UInt64,
  betType: CircuitString,
  yesBetAmount: UInt64,
  noBetAmount: UInt64,
  isOver: Bool,
  result: Bool,
  startingTimestamp: UInt64,
  endingTimestamp: UInt64,
  minimumStakeAmount: UInt64,
  linkedBetId: UInt64,
  description: CircuitString,
}) {}

export class StakedId extends Struct({
  betId: UInt64,
  publicKey: PublicKey,
}) {}

@runtimeModule()
export class PredictionMarket extends RuntimeModule {
  @state() public stakedToYes = StateMap.from<StakedId, UInt64>(
    StakedId,
    UInt64,
  );
  @state() public stakedToNo = StateMap.from<StakedId, UInt64>(
    StakedId,
    UInt64,
  );
  @state() public lastBetId = State.from<UInt64>(UInt64);
  @state() public totalBets = StateMap.from(UInt64, Bets);

  constructor(@inject("Balances") private balances: Balances) {
    super();
  }

  @runtimeMethod()
  public async createBet(
    minimumStakeAmount: UInt64,
    betType: CircuitString,
    description: CircuitString,
    linkedBetId: UInt64,
    duration: UInt64,
  ) {
    let linkedID = betType === CircuitString.fromString("Short") ? linkedBetId : UInt64.zero;
    let lastBetId = (await this.lastBetId.get()).orElse(UInt64.zero);
    let bet = new Bets({
      betId: lastBetId,
      betType: betType,
      yesBetAmount: UInt64.zero,
      noBetAmount: UInt64.zero,
      isOver: Bool(false),
      result: Bool(false),
      startingTimestamp: UInt64.from(0),
      endingTimestamp: UInt64.from(duration),
      minimumStakeAmount: minimumStakeAmount,
      linkedBetId: linkedID,
      description: description,
    });
    await this.lastBetId.set(lastBetId.add(1));
    await this.totalBets.set(lastBetId.add(1), bet);
    return bet;
  }

  @runtimeMethod()
  public async placeBet(inputBetId: UInt64, outcome: Bool, amount: UInt64) {
    Provable.log("SM betId : ", inputBetId);
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

    let stakedToYesNew = Provable.if<UInt64>(
      outcome,
      UInt64,
      summup,
      stakedToYes,
    );

    // let stakedToYesNew = Provable.switch([outcome], Field, [summup]);
    Provable.log("Staked to yes new: ", stakedToYesNew);

    stakedToYesNew = UInt64.from(stakedToYesNew);

    await this.stakedToYes.set(stakedIds, stakedToYesNew);

    const stakedToNo = (await this.stakedToNo.get(stakedIds)).orElse(
      UInt64.zero,
    );

    summup = UInt64.from(stakedToNo.add(amountBet));

    let stakedToNoNew = Provable.if<UInt64>(
        Bool(true),
        UInt64,
        summup,
        stakedToNo,
    );

    stakedToNoNew = UInt64.from(stakedToNoNew);

    await this.stakedToNo.set(stakedIds, stakedToNoNew);

    // Update the bet
    let newBet = new Bets({
      betId: theBet.betId,
      betType: theBet.betType,
      yesBetAmount: theBet.yesBetAmount.add(amountBet),
      noBetAmount: theBet.noBetAmount.add(amountBet),
      isOver: theBet.isOver,
      result: theBet.result,
      startingTimestamp: theBet.startingTimestamp,
      endingTimestamp: theBet.endingTimestamp,
      minimumStakeAmount: theBet.minimumStakeAmount,
      linkedBetId: theBet.linkedBetId,
      description: theBet.description,
    });

    await this.totalBets.set(betId, newBet);
  }

  @runtimeMethod()
  public async shortBetOnLongBet(
    betId: UInt64,
    minimumStakeAmount: UInt64,
    duration: UInt64,
  ) {
    // let theBet = (await this.totalBets.get(betId)).value;
    // assert(theBet.isOver.not(), "The bet is over");
    // assert(
    //   theBet.linkedBetId.greaterThanOrEqual(UInt64.zero),
    //   "The bet already have a linked bet",
    // );
    // assert(
    //   Bool(theBet.betType === CircuitString.fromString("Long")),
    //   "The bet is not a Long bet",
    // );
    // assert(
    //   duration.greaterThan(UInt64.zero),
    //   "Duration must be greater than 0",
    // );
    // let delta = theBet.endingTimestamp.value.sub(duration.value);
    // assert(
    //   delta.lessThanOrEqual(0),
    //   "Duration is greater than the remaining time of the bet",
    // );

    await this.createBet(
      minimumStakeAmount,
      CircuitString.fromString("Short"),
      CircuitString.fromString("Will it be more Yes or No ?"),
      betId,
      duration
    );
  }

  @runtimeMethod()
  public async closeMarket(
    betId: UInt64, // ID du pari
    temperature: Field, // Température fournie par l'oracle
    timestamp: Field, // Timestamp de la mesure
    signature: Signature,
    oraclePublicKey: PublicKey,
  ) {
    let theBet = (await this.totalBets.get(betId)).value;
    assert(
      this.network.block.height.value.greaterThan(theBet.endingTimestamp.value),
      "Bet is not yet over",
    );

    // Vérifier la signature
    const message = [temperature, timestamp];
    const isValid = signature.verify(oraclePublicKey, message);
    assert(isValid, "Invalid signature");

    theBet.isOver = Bool(true);
    theBet.result = Bool(true);

    await this.totalBets.set(betId, theBet);
  }

  @runtimeMethod()
  public async claimWinnings(betId: UInt64, address: PublicKey) {
    let theBet = (await this.totalBets.get(betId)).value;
    assert(theBet.isOver, "The bet is not closed yet");
    let stakedIds = new StakedId({
      betId: betId,
      publicKey: this.transaction.sender.value,
    });
    let amountToSend = (await this.stakedToYes.get(stakedIds)).value;
    const tokenId = TokenId.from(0);

    await this.balances.mint(tokenId, address, amountToSend);
  }

  @runtimeMethod()
  public async test(miniStakeAmount : UInt64, betType: CircuitString, description: CircuitString) {
    return new Bets({
      betId: UInt64.from(0),
      betType: betType,
      yesBetAmount: UInt64.from(0),
      noBetAmount: UInt64.from(0),
      isOver: Bool(false),
      result: Bool(false),
      startingTimestamp: UInt64.from(0),
      endingTimestamp: UInt64.from(0),
      minimumStakeAmount: UInt64.from(0),
      linkedBetId: UInt64.from(0),
      description: description,
    });
  }
}
import { UInt64 } from "@proto-kit/library";
import { runtimeModule, state, runtimeMethod, RuntimeModule } from "@proto-kit/module";
import {assert, State, StateMap} from "@proto-kit/protocol";
import {PublicKey, Bool, Struct, CircuitString, Provable} from "o1js";
import {inject} from "tsyringe";
import {Balances} from "../../../../../../../../my-chain/packages/chain/src/runtime/modules/balances";

export class Bets extends Struct({
    predictionId: UInt64,
    numberOfYesBets: UInt64,
    numberOfNoBets: UInt64,
    result: Bool,
    endingTime: UInt64,
    isResolved: Bool,
    description: CircuitString
}){}

export class Prediction extends Struct({
    betId: UInt64,
    PK: PublicKey
}){}

@runtimeModule()
export class PredictionMarket extends RuntimeModule {
    @state() public yesBet = StateMap.from<Prediction, UInt64>(Prediction, UInt64);
    @state() public noBet = StateMap.from<Prediction, UInt64>(Prediction, UInt64);
    @state() public lastId = State.from<UInt64>(UInt64);
    @state() public totalBets = StateMap.from(UInt64, Bets)

    constructor(@inject("Balances") private balances: Balances) {
        super();
    }

    @runtimeMethod()
    async createBet(endTime: UInt64, description: CircuitString) {
        let lastBetId = (await this.lastId.get()).orElse(UInt64.from(0));
        await this.lastId.set(lastBetId.add(1));
        let bet = new Bets({
            predictionId: lastBetId,
            numberOfYesBets: UInt64.from(0),
            numberOfNoBets: UInt64.from(0),
            result: Bool(false),
            endingTime: endTime,
            isResolved: Bool(false),
            description: description
        });
        await this.totalBets.set(lastBetId.add(1), bet);
        return bet;
    }

    @runtimeMethod()
    async getBets() {
        return this.totalBets;
    }

    @runtimeMethod()
    async getBetById(betId: UInt64) {
        return this.totalBets.get(betId);
    }

    @runtimeMethod()
    public async placeBet(predictionId: UInt64, prediction_result: Bool, amount: UInt64) {
        let bet = (await this.totalBets.get(predictionId)).value;
        assert(bet.isResolved.not(), "The bet is already resolved");
        assert(amount.greaterThan(UInt64.from(0)), "Amount must be greater than 0");

        let prediction = new Prediction({
            betId: predictionId,
            PK: this.transaction.sender.value
        });

        bet.numberOfYesBets = Provable.if<UInt64>(prediction_result, UInt64, bet.numberOfYesBets.add(amount), bet.numberOfYesBets);
        const betOnYes = (await this.yesBet.get(prediction)).orElse(UInt64.zero);
        let newBetOnYes = Provable.if<UInt64>(prediction_result, UInt64, betOnYes.add(amount), betOnYes);
        await this.yesBet.set(prediction, newBetOnYes);

        bet.numberOfNoBets = Provable.if<UInt64>(prediction_result, UInt64, bet.numberOfNoBets.add(amount), bet.numberOfNoBets);
        const betOnNo = (await this.yesBet.get(prediction)).orElse(UInt64.zero);
        let newBetOnNo = Provable.if<UInt64>(prediction_result, UInt64, betOnNo.add(amount), betOnNo);
        await this.yesBet.set(prediction, newBetOnNo);
    }

    // @method async verifyPrediction(prediction: Field, secret: Field) {
    //     let hashedInputs = Poseidon.hash([prediction, secret]);
    //     this.expected.requireEquals(hashedInputs);
    // }
    //
    // @method async setResult(result: Field) {
    //     this.result.set(result);
    // }
    //
    // @method async checkResult() {
    //     this.result.requireEquals(this.prediction.get());
    // }
}
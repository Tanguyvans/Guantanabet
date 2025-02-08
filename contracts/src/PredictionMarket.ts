import { Field, SmartContract, state, State, method, Struct, PublicKey } from 'o1js';

// Define market structure
class Market extends Struct({
    totalPool: Field,
    yesPool: Field,
    resolved: Field,
    outcome: Field,
    endTime: Field
}) {
    static empty(): Market {
        return new Market({
            totalPool: Field(0),
            yesPool: Field(0),
            resolved: Field(0),
            outcome: Field(0),
            endTime: Field(0)
        });
    }
}

export class PredictionMarket extends SmartContract {
    @state(Field) numMarkets = State<Field>();
    @state(Market) markets = State<Market>();
    @state(Market) currentMarket = State<Market>();

    constructor(address: PublicKey) {
        super(address);
    }

    init() {
        super.init();
        this.numMarkets.set(Field(0));
        this.markets.set(Market.empty());
    }

    @method async createMarket(
        endTime: Field
    ): Promise<void> {
        const currentNum = this.numMarkets.get();
        this.numMarkets.requireEquals(currentNum);

        // Create new market
        const market = new Market({
            totalPool: Field(0),
            yesPool: Field(0),
            resolved: Field(0),
            outcome: Field(0),
            endTime: endTime
        });

        // Store market
        this.markets.set(market);

        // Increment number of markets
        this.numMarkets.set(currentNum.add(1));
    }
    
}
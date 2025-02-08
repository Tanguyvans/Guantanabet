import { Field, SmartContract, state, State, method, Struct, PublicKey, MerkleMap, Poseidon } from 'o1js';

// Define market structure
class Market extends Struct({
    totalPool: Field,
    yesPool: Field,
    resolved: Field,
    outcome: Field,
    endTime: Field,
    betsCommitmentRoot: Field
}) {
    static empty(): Market {
        return new Market({
            totalPool: Field(0),
            yesPool: Field(0),
            resolved: Field(0),
            outcome: Field(0),
            endTime: Field(0),
            betsCommitmentRoot: Field(0)
        });
    }
}

export class PredictionMarket extends SmartContract {
    @state(Field) marketsRoot = State<Field>();

    init() {
        super.init();
        this.marketsRoot.set(Field(0));
    }

    @method async createMarket(
        marketId: Field,
        endTime: Field,
    ) {
        // Get current root
        const currentRoot = this.marketsRoot.get();
        this.marketsRoot.requireEquals(currentRoot);

        // Create new market
        const market = new Market({
            totalPool: Field(0),
            yesPool: Field(0),
            resolved: Field(0),
            outcome: Field(0),
            endTime: endTime,
            betsCommitmentRoot: Field(0)
        });

        // Update root with new market data
        // We'll use a simple hash of the market ID and data as the new root
        const newRoot = Poseidon.hash([
            marketId,
            market.totalPool,
            market.yesPool,
            market.resolved,
            market.outcome,
            market.endTime,
            market.betsCommitmentRoot
        ]);

        this.marketsRoot.set(newRoot);
    }
}
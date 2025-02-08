import { runtimeModule, state, runtimeMethod } from "@proto-kit/module";
import { PublicKey } from "o1js";
import { State, StateMap, assert } from "@proto-kit/protocol";
import { Balance, BalancesKey, Balances as BaseBalances, errors, TokenId } from "@proto-kit/library";

interface BalancesConfig {
  totalSupply: Balance;
}

@runtimeModule()
export class Balances extends BaseBalances<BalancesConfig> {
  @state() public circulatingSupply = State.from<Balance>(Balance);
  @state() public balances = StateMap.from<BalancesKey, Balance>(
    BalancesKey,
    Balance
  );

  @runtimeMethod()
  public async addBalance(
    tokenId: TokenId,
    address: PublicKey,
    amount: Balance
  ): Promise<void> {
    const circulatingSupply = await this.circulatingSupply.get();
    const newCirculatingSupply = Balance.from(circulatingSupply.value).add(
      amount
    );
    assert(
      newCirculatingSupply.lessThanOrEqual(this.config.totalSupply),
      "Circulating supply would be higher than total supply"
    );
    await this.circulatingSupply.set(newCirculatingSupply);
    await this.mint(tokenId, address, amount);
  }

  public async getBalance(
    tokenId: TokenId,
    address: PublicKey
  ): Promise<Balance> {
    const key = new BalancesKey({ tokenId, address });
    const balanceOption = await this.balances.get(key);
    return Balance.Unsafe.fromField(balanceOption.value.value);
  }
}

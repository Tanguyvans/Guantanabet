import { Balance, VanillaRuntimeModules } from "@proto-kit/library";
import { ModulesConfig } from "@proto-kit/common";

import { Balances } from "./modules/balances";
import { PredictionMarket } from "./modules/PredictionMarket";

export const modules = VanillaRuntimeModules.with({
  Balances,
  PredictionMarket,
});

export const config: ModulesConfig<typeof modules> = {
  Balances: {
    totalSupply: Balance.from(10_000),
  },
  PredictionMarket: {
  },
};

export default {
  modules,
  config,
};

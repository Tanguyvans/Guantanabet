"use client";
import "reflect-metadata";
import AsyncPageDynamic from "@/containers/async-page-dynamic";
import { ClientAppChain } from "@proto-kit/sdk";

import {fetchAccount, Mina, PublicKey} from "o1js";
import { PredictionMarket } from "chain/dist/runtime/modules/PredictionMarket";

export default function Home() {
  return <AsyncPageDynamic />;
  
}

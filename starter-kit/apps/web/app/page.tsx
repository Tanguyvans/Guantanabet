'use client';

import "reflect-metadata";
import AsyncPageDynamic from "@/containers/async-page-dynamic";
import { PredictionMarket } from "chain/dist/runtime/modules/PredictionMarket";

export default function Home() {
  return <AsyncPageDynamic />;
}
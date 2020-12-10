import { InMemoryCache, ReactiveVar, makeVar } from "@apollo/client";
import { GlobalState } from "@/models/GlobalState";

export const cache: InMemoryCache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        globalState: {
          read() {
            return globalStateVar();
          },
        },
        internalSymbols: {
          read() {
            return internalSymbolsVar();
          },
        },
        activeTrades: {
          // this stops the merge error happening
          // https://github.com/apollographql/apollo-client/issues/6868
          merge(_, incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

export const globalStateVar: ReactiveVar<GlobalState> = makeVar<GlobalState>({
  currentStock: {
    name: "SM PRIME HOLDINGS, INC.",
    symbol: "SMPH",
  },
});

export const internalSymbolsVar: ReactiveVar<string[]> = makeVar<string[]>([]);

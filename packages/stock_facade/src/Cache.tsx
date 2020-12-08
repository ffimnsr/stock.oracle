import { InMemoryCache, ReactiveVar, makeVar } from "@apollo/client";
import { GlobalState } from "@/models/GlobalState";

export const cache: InMemoryCache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        globalState: {
          read () {
            return globalStateVar();
          }
        },
      },
    },
  },
});

export const globalStateVar: ReactiveVar<GlobalState> = makeVar<GlobalState>({
  currentStock: {
    "name": "SM PRIME HOLDINGS, INC.",
    "symbol": "SMPH",
  },
});
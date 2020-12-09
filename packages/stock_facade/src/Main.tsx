import React from "react";
import { render as Render } from "react-dom";
import log from "loglevel";
import _ from "lodash";
import { AppRouter } from "@/App";
import { createHttpLink, ApolloClient, ApolloProvider, ApolloLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import "@/assets/styles/main.scss";
import { cache } from "@/Cache";
import { BrowserRouter } from "react-router-dom";

const WHITELIST_DOMAINS = ["localhost", "trade.foureveryoung.online"];
const GRAPH_URI = process.env.REACT_APP_GRAPH_URI;

log.setLevel(log.levels.DEBUG);
log.trace("GraphQL URI:", GRAPH_URI);

const httpLink = createHttpLink({
  uri: GRAPH_URI,
  credentials: "same-origin",
});

const authLink = setContext((_, { headers }) => {
  const token = btoa("oracle_admin:oracle_pass");
  return {
    headers: {
      ...headers,
      Authorization: `Basic ${token}`,
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const client = new ApolloClient({
  cache,
  link: ApolloLink.from([authLink, errorLink, httpLink]),
});

function render(): void {
  Render(
    <ApolloProvider client={client}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ApolloProvider>,
    document.getElementById("app"),
  );
}

if (_.includes(WHITELIST_DOMAINS, window.location.hostname)) {
  log.info("Oracle starting up.");

  if (module.hot) {
    module.hot.accept("@/App", () => render());
  }

  render();
}

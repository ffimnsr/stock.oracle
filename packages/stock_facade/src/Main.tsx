import React from "react";
import { render as Render } from "react-dom";
import log from "loglevel";
import _ from "lodash";
import { App } from "./App";

const WHITELIST_DOMAINS = ["localhost", "trade.foureveryoung.online"];

function render(): void {
  Render(<App />, document.getElementById("app"));
}

if (_.includes(WHITELIST_DOMAINS, window.location.hostname)) {
  log.info("Oracle starting up.");
  render();
}

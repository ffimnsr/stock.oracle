import * as React from "react";
import { render as Render } from "react-dom";

import { Hello } from "./App";

Render(
  <Hello />,
  document.getElementById("app")
);

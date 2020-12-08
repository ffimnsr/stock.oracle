import React from "react";
import styled from "styled-components";
import { H5, Spinner } from "@blueprintjs/core";

export const CustomMain = styled.main`
  padding: 20px;
`;

export const CustomH5 = styled(H5)`
  margin: 0;
`;

export const HeaderSplitContainer = styled.div`
  display: flex;
  margin: 0 5px;
`;

export const HeaderGroup = styled.div`
  flex: 1;
`;

export const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export const SpinnerLoad = () => (
  <SpinnerContainer>
    <Spinner size={Spinner.SIZE_STANDARD} />
  </SpinnerContainer>
);

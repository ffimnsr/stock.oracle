/// <reference path="./types/mixins.d.ts" />
import React, { useState, useEffect } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import log from "loglevel";
import { IconNames } from "@blueprintjs/icons";
import {
  Alignment,
  Navbar,
  Button,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  Classes,
  FocusStyleManager,
  Card,
  H5,
  Divider,
  Popover,
  Menu,
  Position,
  MenuItem,
  Colors,
  NonIdealState,
} from "@blueprintjs/core";
import Highcharts from "highcharts/highstock";
import HSNoDataToDisplay from "highcharts/modules/no-data-to-display";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { StockChart } from "@/components/StockChart";
import { StockSearchBar } from "@/components/StockSearchBar";
import { BnSCalcDrawer } from "@/components/BnSCalcDrawer";
import { MostActiveSecurityView } from "@/components/MostActiveSecurityTable";
import { TopGainersSecurityView } from "@/components/TopGainersSecurityTable";
import { TopLosersSecurityView } from "@/components/TopLosersSecurityTable";
import { CustomMain } from "@/components/Commons";
import { AppJournal } from "@/Journal";
import { AppStocksOverview } from "@/StocksOverview";

FocusStyleManager.onlyShowFocusOnTabs();
HSNoDataToDisplay(Highcharts);

const CustomStockSuggestContainer = styled.div`
  margin-left: 30px;
  width: 420px;
`;

const SplitContainer = styled.div`
  display: flex;
  margin-top: 20px;
`;

const InnerContainer = styled(Card)`
  flex: 1;
  margin: 5px;
`;

const NoMatchContainer = styled.div`
  height: 92vh;
  margin: auto;
`;

export const AppRouter = () => {
  const history = useHistory();
  const [calcDrawerIsOpen, setCalcDrawerIsOpen] = useState(false);

  const handleCalcOpen = () => setCalcDrawerIsOpen(true);
  const handleCalcClose = () => setCalcDrawerIsOpen(false);
  const handleOpenDashboard = () => history.push("/");
  const handleOpenJournal = () => history.push("/journal");
  const handleOpenOverview = () => history.push("/overview");

  return (
    <div>
      <header>
        <Navbar className={Classes.DARK}>
          <NavbarGroup align={Alignment.LEFT}>
            <NavbarHeading>
              <Popover position={Position.BOTTOM_LEFT}>
                <Button minimal={true} icon={IconNames.HOME} />
                <Menu>
                  <MenuItem
                    onClick={handleOpenDashboard}
                    icon={IconNames.DASHBOARD}
                    text="Dashboard"
                  />
                  <MenuItem
                    onClick={handleOpenOverview}
                    icon={IconNames.SERIES_SEARCH}
                    text="Stocks Overview"
                  />
                  <MenuItem
                    onClick={handleCalcOpen}
                    icon={IconNames.CALCULATOR}
                    text="Calculator (Common Stocks)"
                  />
                  <MenuItem icon={IconNames.LAYOUT_AUTO} text="Calculator (Crypto)" />
                  <MenuItem icon={IconNames.FLOW_BRANCH} text="Risk Calculator" />
                  <MenuItem icon={IconNames.EYE_OPEN} text="Watchlist" />
                  <MenuItem
                    onClick={handleOpenJournal}
                    icon={IconNames.BOOK}
                    text="Journal"
                  />
                </Menu>
              </Popover>
            </NavbarHeading>
            <NavbarDivider />
            <CustomStockSuggestContainer>
              <StockSearchBar />
            </CustomStockSuggestContainer>
          </NavbarGroup>
          <NavbarGroup align={Alignment.RIGHT}>
            <Button
              onClick={handleCalcOpen}
              minimal={true}
              icon={IconNames.CALCULATOR}
              text="Calc"
            />
            <Button
              onClick={handleOpenJournal}
              minimal={true}
              icon={IconNames.BOOK}
              text="Journal"
            />
          </NavbarGroup>
        </Navbar>
      </header>
      <Switch>
        <Route exact path="/">
          <AppHome />
        </Route>
        <Route exact path="/journal">
          <AppJournal />
        </Route>
        <Route exact path="/overview">
          <AppStocksOverview />
        </Route>
        <Route path="*">
          <NoMatch />
        </Route>
      </Switch>
      <BnSCalcDrawer isOpen={calcDrawerIsOpen} closeCb={handleCalcClose} />
    </div>
  );
};

const NoMatch = () => {
  const description = (
    <>
      We looked all over, but the page seems to have gotten away from us. Check the links
      below to get back on track.
    </>
  );

  return (
    <NoMatchContainer>
      <NonIdealState
        icon={IconNames.AIRPLANE}
        title="Page Not Found"
        description={description}
      />
    </NoMatchContainer>
  );
};

const AppHome = () => {
  return (
    <CustomMain>
      <StockChart />
      <SplitContainer>
        <InnerContainer interactive={true}>
          <MostActiveSecurityView />
        </InnerContainer>
        <InnerContainer interactive={true}>
          <TopGainersSecurityView />
        </InnerContainer>
        <InnerContainer interactive={true}>
          <TopLosersSecurityView />
        </InnerContainer>
      </SplitContainer>
    </CustomMain>
  );
};

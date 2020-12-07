/// <reference path="./types/mixins.d.ts" />
import React, { useState, useEffect } from "react";
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
} from "@blueprintjs/core";
import Highcharts from "highcharts/highstock";
import NoDataToDisplay from "highcharts/modules/no-data-to-display";
import styled from "styled-components";
import { StockChart } from "@/components/StockChart";
import { StockSearchBar } from "@/components/StockSearchBar";
import { BnSCalcDrawer } from "@/components/BnSCalcDrawer";
import { MostActiveSecurityTable } from "@/components/MostActiveSecurityTable";
import { TopGainersSecurityTable } from "@/components/TopGainersSecurityTable";
import { TopLosersSecurityTable } from "@/components/TopLosersSecurityTable";

FocusStyleManager.onlyShowFocusOnTabs();
NoDataToDisplay(Highcharts);

const CustomStockSuggestContainer = styled.div`
  margin-left: 30px;
  width: 420px;
`;

const CustomMain = styled.main`
  padding: 20px;
`;

const SplitContainer = styled.div`
  display: flex;
  margin-top: 20px;
`;

const InnerContainer = styled(Card)`
  flex: 1;
  margin: 5px;
`;

const CustomH5 = styled(H5)`
  margin-left: 5px;
`;

export function App(): JSX.Element {
  const [calcDrawerIsOpen, setCalcDrawerIsOpen] = useState(false);
  const [journalDrawerIsOpen, setJournalDrawerIsOpen] = useState(false);

  const handleCalcOpen = () => setCalcDrawerIsOpen(true);
  const handleCalcClose = () => setCalcDrawerIsOpen(false);
  const handleJournalOpen = () => setJournalDrawerIsOpen(true);
  const handleJournalClose = () => setJournalDrawerIsOpen(false);

  return (
    <div>
      <header>
        <Navbar className={Classes.DARK}>
          <NavbarGroup align={Alignment.LEFT}>
            <NavbarHeading>
              <Popover position={Position.BOTTOM_LEFT}>
                <Button minimal={true} icon={IconNames.HOME} />
                <Menu>
                  <MenuItem icon={IconNames.DASHBOARD} text="Dashboard" />
                  <MenuItem onClick={handleCalcOpen} icon={IconNames.CALCULATOR} text="Calculator (Common Stocks)" />
                  <MenuItem icon={IconNames.LAYOUT_AUTO} text="Calculator (Crypto)" />
                  <MenuItem icon={IconNames.FLOW_BRANCH} text="Risk Calculator" />
                  <MenuItem onClick={handleJournalOpen} icon={IconNames.BOOK} text="Journal" />
                </Menu>
              </Popover>
            </NavbarHeading>
            <NavbarDivider />
            <CustomStockSuggestContainer>
              <StockSearchBar />
            </CustomStockSuggestContainer>
          </NavbarGroup>
          <NavbarGroup align={Alignment.RIGHT}>
            <Button onClick={handleCalcOpen} minimal={true} icon={IconNames.CALCULATOR} text="Calc" />
            <Button onClick={handleJournalOpen} minimal={true} icon={IconNames.BOOK} text="Journal" />
          </NavbarGroup>
        </Navbar>
      </header>
      <CustomMain>
        <StockChart />
        <SplitContainer>
          <InnerContainer interactive={true}>
            <CustomH5>Most Active</CustomH5>
            <Divider />
            <MostActiveSecurityTable />
          </InnerContainer>
          <InnerContainer interactive={true}>
            <CustomH5>Top Gainers</CustomH5>
            <Divider />
            <TopGainersSecurityTable />
          </InnerContainer>
          <InnerContainer interactive={true}>
            <CustomH5>Top Losers</CustomH5>
            <Divider />
            <TopLosersSecurityTable />
          </InnerContainer>
        </SplitContainer>
      </CustomMain>
      <BnSCalcDrawer isOpen={calcDrawerIsOpen} closeCb={handleCalcClose} />
    </div>
  );
}

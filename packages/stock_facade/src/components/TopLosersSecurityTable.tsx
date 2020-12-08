import React, { useState, useEffect } from "react";
import log from "loglevel";
import axios from "axios";
import styled from "styled-components";
import { FixedSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Classes, Colors, Button, Divider } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { SpinnerLoad, HeaderSplitContainer, HeaderGroup, CustomH5 } from "@/components/Commons";

const LoadingCell = styled.div`
  margin: auto;
`;

const Container = styled.div`
  height: 360px;
  margin-top: 10px;
  margin-left: 5px;
  margin-right: 5px;
`;

const RowContainer = styled.div`
  display: flex;
`;

const CustomOveflowSpan = styled.div`
  flex: 1 0 60%;
  width: calc(60%);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  color: ${Colors.RED1}
`;

const CustomSpan = styled.div`
  flex: 1;
  text-align: right;
  color: ${Colors.RED1}
`;

const Row = ({ index, data, style }: { index: any, data: any, style: any }) => {
  const security = data[index];
  return (
    <RowContainer style={style}>
      <CustomOveflowSpan>{security.securityName.toUpperCase()}</CustomOveflowSpan>
      <CustomSpan>{parseFloat(security.percChangeClose).toFixed(2)}</CustomSpan>
    </RowContainer>
  );
};

export async function getTopLosers(): Promise<any> {
  const response = await axios.get(
    "https://tote_proxy.alice-in-wonderland.workers.dev/stocks/get_declines_security",
  );

  const { data } = response;
  if (data.records.length === 0 || data.records === null) {
    return null;
  }

  return response;
}

type Props = {
  data: {
    records: never[];
    count: number;
    isFetching: boolean;
  };
};

export const TopLosersSecurityTable = React.memo(({ data }: Props): JSX.Element => {
  return (
    <Container>
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            useIsScrolling={true}
            height={height}
            itemCount={data.count}
            itemData={data.records}
            itemSize={35}
            width={width}
          >
            {Row}
          </FixedSizeList>
        )}
      </AutoSizer>
    </Container>
  );
});

export const TopLosersSecurityView = () => {
  const [data, setData] = useState({
    records: [],
    count: 0,
    isFetching: false,
  });

  const fetchTopLosers = async () => {
    try {
      setData({ ...data, isFetching: true });
      const response = await getTopLosers();
      setData({
        records: response.data.records,
        count: response.data.count,
        isFetching: false,
      });
    } catch (e) {
      log.error(e);
      setData({ ...data, isFetching: false });
    }
  };

  useEffect(() => {
    fetchTopLosers();
  }, []);

  if (data.isFetching) {
    return <SpinnerLoad />;
  }

  return (
    <>
      <HeaderSplitContainer>
        <HeaderGroup style={{ display: "flex", alignItems: "center" }}>
          <CustomH5>Top Losers</CustomH5>
        </HeaderGroup>
        <HeaderGroup style={{ textAlign: "right" }}>
          <Button minimal={true} icon={IconNames.REFRESH} onClick={() => fetchTopLosers()} />
        </HeaderGroup>
      </HeaderSplitContainer>
      <Divider />
      <TopLosersSecurityTable data={data} />
    </>
  );
};

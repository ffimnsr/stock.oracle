import React, { useState, useEffect } from "react";
import log from "loglevel";
import axios, { CancelTokenSource } from "axios";
import styled from "styled-components";
import { FixedSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Colors, Button, Divider } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { SpinnerLoad, HeaderSplitContainer, HeaderGroup, CustomH5 } from "@/components/Commons";
import Axios from "axios";

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
`;

const CustomSpan = styled.div`
  flex: 1;
  text-align: right;
`;

const Row = ({ index, data, style }: { index: any; data: any; style: any }) => {
  const security = data[index];
  const percChangeClose = parseFloat(security.percChangeClose);

  let color = Colors.GREEN1;
  switch (Math.sign(percChangeClose)) {
    case 1:
      color = Colors.GREEN1;
      break;
    case 0:
      color = Colors.GRAY1;
      break;
    case -1:
      color = Colors.RED1;
      break;
  }

  return (
    <RowContainer style={{ ...style, color: color }}>
      <CustomOveflowSpan>{security.securityName.toUpperCase()}</CustomOveflowSpan>
      <CustomSpan>{percChangeClose.toFixed(2)}</CustomSpan>
    </RowContainer>
  );
};

export async function getMostActive(source: CancelTokenSource): Promise<any> {
  const response = await axios.get(
    "https://tote_proxy.alice-in-wonderland.workers.dev/stocks/get_top_security",
    {
      cancelToken: source.token,
    }
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

export const MostActiveSecurityTable = React.memo(({ data }: Props): JSX.Element => {
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

export const MostActiveSecurityView = () => {
  const cancelTokenSource = axios.CancelToken.source();
  const [data, setData] = useState({
    records: [],
    count: 0,
    isFetching: false,
  });

  const fetchMostActive = async (source: CancelTokenSource) => {
    try {
      setData({ ...data, isFetching: true });
      const response = await getMostActive(source);
      setData({
        records: response.data.records,
        count: response.data.count,
        isFetching: false,
      });
    } catch (e) {
      // Ignore Axios cancel throw as that is the
      // one we cancelled.
      if (Axios.isCancel(e)) {
        return;
      }

      log.error(e);
      setData({ ...data, isFetching: false });
    }
  };

  useEffect(() => {
    let mounted = true;

    // Skip fetch if the component is suddenly unmounted.
    // Undoing this may cause memory leaks.
    if (mounted) {
      fetchMostActive(cancelTokenSource);
    }

    return () => {
      mounted = false;
      cancelTokenSource.cancel();
    };
  }, []);

  if (data.isFetching) {
    return <SpinnerLoad />;
  }

  return (
    <>
      <HeaderSplitContainer>
        <HeaderGroup style={{ display: "flex", alignItems: "center" }}>
          <CustomH5>Most Active</CustomH5>
        </HeaderGroup>
        <HeaderGroup style={{ textAlign: "right" }}>
          <Button minimal={true} icon={IconNames.REFRESH} onClick={() => fetchMostActive(cancelTokenSource)} />
        </HeaderGroup>
      </HeaderSplitContainer>
      <Divider />
      <MostActiveSecurityTable data={data} />
    </>
  );
};

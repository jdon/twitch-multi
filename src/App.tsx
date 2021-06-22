import React, { useEffect, useReducer, useState } from "react";
import Embed from "./Embed";
import styled from "styled-components";
import Sidebar from "./Sidebar";
import NoStreams from "./NoStreams";

import { gridify } from "./util";

const Videos = styled.div`
  height: 100%;
  width: 100%;
`;

const MultiContainer = styled.div`
  height: 100vh;

  display: flex;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;

  width: 100%;
  height: 100%;
`;

const Column = styled.div<{ orientation: "vertical" | "horizontal" }>`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: ${(props) =>
    props.orientation === "vertical" ? "column" : "row"};

  ${Row} {
    flex-direction: ${(props) =>
      props.orientation === "vertical" ? "row" : "column"};
  }
`;

interface AddRemoveAction {
  type: "add" | "remove";
  channelName: string;
}
interface SetAction {
  type: "set";
  channelNames: string[];
}

type AnyAction = AddRemoveAction | SetAction;

const initialState = { channelNames: [] };
const channelReducer = (
  state: { channelNames: string[] },
  action: AnyAction
) => {
  switch (action.type) {
    case "add":
      if (state.channelNames.includes(action.channelName)) return state;
      return { channelNames: [...state.channelNames, action.channelName] };
    case "remove":
      return {
        channelNames: state.channelNames.filter(
          (name) => name !== action.channelName
        ),
      };
    case "set":
      return { channelNames: action.channelNames };
  }
};

function App() {
  const [shouldReconnect, setShouldReconnect] = useState(true);

  const [state, dispatch] = useReducer(channelReducer, initialState);

  const [orientation, setOrientation] =
    useState<"vertical" | "horizontal">("horizontal");

  useEffect(() => {
    const [, ...names] = window.location.pathname.split("/");
    const filteredNames = names.filter((name) => name);

    dispatch({ type: "set", channelNames: filteredNames });
  }, []);

  useEffect(() => {
    if (shouldReconnect) {
      console.log("Reconnecting to SSE");
      setShouldReconnect(false);

      const sse = new EventSource(
        "https://twitchnotification.jdon.dev/streams/events"
      );

      sse.addEventListener("channelOnline", (e: any) =>
        dispatch({ type: "add", channelName: e.data })
      );
      sse.addEventListener("channelOffline", (e: any) =>
        dispatch({ type: "remove", channelName: e.data })
      );

      sse.onerror = () => {
        console.error("SSE closed!");
        setShouldReconnect(true);
      };
    }
  }, [shouldReconnect]);

  useEffect(() => {
    if (state.channelNames.length > 0) {
      document.title = state.channelNames.join("/");
    } else {
      document.title = "No Streams";
    }
  }, [state.channelNames]);

  const streams = React.useMemo(() => {
    return gridify(
      state.channelNames.map((channel, idx) => {
        return (
          <Videos>
            <Embed channelName={channel} index={idx} />
          </Videos>
        );
      })
    );
  }, [state.channelNames]);

  if (state.channelNames.length === 0) return <NoStreams />;

  return (
    <MultiContainer>
      <Sidebar onClick={setOrientation} />

      <Column orientation={orientation}>
        {streams.map((stream) => {
          return <Row>{stream}</Row>;
        })}
      </Column>
    </MultiContainer>
  );
}

export default App;

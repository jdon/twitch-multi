import React, { useEffect, useReducer, useState } from "react";
import Embed from "./Embed";
import styled from "styled-components";
import Sidebar from "./Sidebar";
import NoStreams from "./NoStreams";
import SettingsModal from "./SettingsModal";
import useLocalStorage from "./useLocalStorage";

const Videos = styled.div`
  height: 100%;
  width: 100%;
`;

const MultiContainer = styled.div`
  height: 100vh;

  display: flex;
`;

const Column = styled.div<{
  numStreams: number;
  orientation: "vertical" | "horizontal";
}>`
  width: 100%;
  height: 100%;

  display: grid;
  grid-auto-flow: row;

  ${(props) => {
    if (props.orientation === "horizontal") {
      return `grid-template-columns: repeat(${props.numStreams}, 1fr);`;
    } else {
      return `grid-template-rows: repeat(${props.numStreams}, 1fr);`;
    }
  }}
`;

interface Channel {
  channelName: string;
  stream: React.ReactNode;
}

interface AddRemoveAction {
  type: "add" | "remove";
  channelName: string;
}
interface SetAction {
  type: "set";
  channelNames: string[];
}

type AnyAction = AddRemoveAction | SetAction;

const initialState = { channelNames: [] as Channel[] };
const channelReducer = (
  state: { channelNames: Channel[] },
  action: AnyAction
) => {
  switch (action.type) {
    case "add":
      if (
        state.channelNames.find(
          (channel) => channel.channelName === action.channelName
        )
      )
        return state;
      else
        return {
          channelNames: [
            ...state.channelNames,
            {
              channelName: action.channelName,
              stream: generateStream(action.channelName),
            },
          ],
        };
    case "remove":
      return {
        channelNames: state.channelNames.filter(
          (channel) => channel.channelName !== action.channelName
        ),
      };
    case "set":
      return {
        channelNames: action.channelNames.map((channel) => ({
          channelName: channel,
          stream: generateStream(channel),
        })),
      };
  }
  return state;
};

const generateStream = (channel: string) => {
  return (
    <Videos>
      <Embed channelName={channel} />
    </Videos>
  );
};

function App() {
  const [shouldReconnect, setShouldReconnect] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [orientation] = useLocalStorage<"horizontal" | "vertical">(
    "orientation",
    "horizontal"
  );
  const [ignoreList] = useLocalStorage<string>("ignoreList", "");

  const [state, dispatch] = useReducer(channelReducer, initialState);

  const escapeKeyPress = (e: any) => {
    if (e.keyCode === 27) {
      console.log("Escape pressed");
    }
  };

  useEffect(() => {
    const [, ...names] = window.location.pathname.split("/");
    const filteredNames = names.filter((name) => name);

    dispatch({ type: "set", channelNames: filteredNames });

    document.addEventListener("keydown", escapeKeyPress, false);

    return () => {
      document.removeEventListener("keydown", escapeKeyPress, false);
    };
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
      document.title = state.channelNames
        .map((channel) => channel.channelName)
        .join("/");
      window.history.replaceState(
        null,
        state.channelNames.map((channel) => channel.channelName).join(","),
        `/${state.channelNames.map((channel) => channel.channelName).join("/")}`
      );
    } else {
      window.history.replaceState(null, "No Streams", "/");
    }
  }, [state.channelNames]);

  if (state.channelNames.length === 0) return <NoStreams />;

  const filteredChannels = state.channelNames.filter(
    (channel) => !ignoreList.split(",").includes(channel.channelName)
  );

  return (
    <MultiContainer>
      <Sidebar onSettingsClick={() => setSettingsOpen(true)} />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <Column
        orientation={orientation}
        numStreams={Math.ceil(Math.sqrt(filteredChannels.length))}
      >
        {filteredChannels.map((channel) => channel.stream)}
      </Column>
    </MultiContainer>
  );
}

export default App;

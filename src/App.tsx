import React, { useEffect, useReducer, useState } from "react";
import Embed from "./Embed";
import styled from "styled-components";
import Sidebar from "./Sidebar";
import NoStreams from "./NoStreams";
import SettingsModal from "./SettingsModal";
import useLocalStorage from "./useLocalStorage";

const Videos = styled.div``;

const MultiContainer = styled.div`
  height: 100vh;

  background-color: black;
  display: flex;
`;

const Column = styled.div<{
  numStreams: number;
  orientation: "vertical" | "horizontal";
}>`
  width: 100%;
  height: 100%;

  display: flex;
  flex-flow: row wrap;
  justify-content: center;

  flex-flow: ${(props) =>
    `${props.orientation === "horizontal" ? "row" : "column"} wrap`};

  ${Videos} {
    flex-basis: ${(props) => `${100 / props.numStreams}%`};
  }
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
  channelNames: Channel[];
}

type AnyAction = AddRemoveAction | SetAction;

const initialState = { channelNames: [] as Channel[] };
const channelReducer = (
  state: { channelNames: Channel[] },
  action: AnyAction
) => {
  // TODO: Sort logic in here?
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
        channelNames: action.channelNames,
      };
  }
  return state;
};

const generateStream = (channel: string) => {
  console.log("Generating", channel);
  return <Embed channelName={channel} />;
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

  useEffect(() => {
    const [, ...names] = window.location.pathname.split("/");
    const filteredNames = names.filter((name) => name);

    dispatch({
      type: "set",
      channelNames: filteredNames.map((channel) => ({
        channelName: channel,
        stream: generateStream(channel),
      })),
    });
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

  const filteredChannels = state.channelNames.filter(
    (channel) => !ignoreList.split(",").includes(channel.channelName)
  );

  if (filteredChannels.length === 0) return <NoStreams />;

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
        {filteredChannels.map((channel) => {
          console.log(channel.channelName);
          return <Videos key={channel.channelName}>{channel.stream}</Videos>;
        })}
      </Column>
    </MultiContainer>
  );
}

export default App;

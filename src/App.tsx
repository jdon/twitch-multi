import React, { useEffect, useReducer, useState } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
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

const IgnoreStreamButton = styled.div`
  color: grey;
  text-align: right;
  position: relative;
  top: 0;
  font-size: 15px;
  opacity: 0;

  &:hover {
    cursor: pointer;
    opacity: 1;
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


interface channelNotification {
  notification_type: "online" | "offline"
  channel: string
}

interface onlineChannels {
  online_channels: string[]
}

type WebsocketMessage = onlineChannels | channelNotification;

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
  const [ignoreList, setIgnoreList] = useLocalStorage<string>("ignoreList", "");

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
      console.log("Reconnecting to websocket");
      setShouldReconnect(false);
      const client = new W3CWebSocket('wss://ws.jdon.dev');

      client.onmessage = (websocketMessage) => {
        console.log(websocketMessage.data);
        const message = JSON.parse(websocketMessage.data as unknown as string) as WebsocketMessage;
        if("online_channels" in message) {
          const onlineChannels = message.online_channels;
          dispatch({
            type: "set",
            channelNames: onlineChannels.map((channel) => ({
              channelName: channel,
              stream: generateStream(channel),
            })),
          });
        }
        if("notification_type" in message) {
          const notificationType = message.notification_type;
          const affectedChannel = message.channel;
          const typeToSend = notificationType === "online" ? "add" : "remove";
          dispatch({ type: typeToSend, channelName:affectedChannel })
        }
      };

      client.onerror = (err) => {
        console.error("Websocket errored!");
        setShouldReconnect(true);
      }
      client.onopen = () => {
        client.send("channels");
      }
      client.onclose = (err) => {
        console.error("Websocket closed!");
        setShouldReconnect(true);
      }
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
        {filteredChannels.length === 0 && !settingsOpen && <NoStreams />}
        {filteredChannels.map((channel) => {
          console.log(channel.channelName);
          return (
             <Videos key={channel.channelName}>
                <IgnoreStreamButton onClick={() => setIgnoreList(ignoreList.toString() + channel.channelName + ",")}>
                😎
                </IgnoreStreamButton>
               {channel.stream}
              </Videos>
              );
        })}
      </Column>
    </MultiContainer>
  );
}

export default App;

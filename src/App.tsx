import React, { useEffect, useMemo, useReducer, useState } from "react";
import Embed from "./Embed";
import styled from "styled-components";
import Sidebar from "./Sidebar";

import NoStreams from "./NoStreams";
import SettingsModal from "./SettingsModal";
import useLocalStorage from "./useLocalStorage";

import useWebSocket from 'react-use-websocket';
import { chunk, cloneDeep, cloneDeepWith } from "lodash";

const Video = styled.div`
  aspect-ratio: 16/9;
`;

const MultiContainer = styled.div`
  height: 100%;

  background-color: black;
  display: flex;
`;

const StreamGrid = styled.div<{
  numStreams: number;
  orientation: "vertical" | "horizontal";
}>`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Row = styled.div<{ numberOfColumns: number, isLast: boolean }>`
  display: grid;
  flex-direction: row;
  justify-content: center;
  grid-template-columns: ${props => `repeat(${props.numberOfColumns}, 1fr);`}

  ${props => props.isLast && `
      display: flex;
      aspect-ratio: unset;

      flex: 1;
  `}

  ${Video} {
    ${props => props.isLast && `
      display: flex;
      aspect-ratio: unset;
      flex: 1;
    `}
  }
`

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

interface ChannelUpdateEvent {
  notification_type: "online" | "offline"
  channel: string
}

interface OnlineChannelsEvent {
  online_channels: string[]
}

type WebsocketMessage = ChannelUpdateEvent | OnlineChannelsEvent;

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
        channelNames: action.channelNames,
      };
  }
};

const generateGrid = <T extends unknown>(array: T[], numberOfRows?: number) => {
  const gridLength = (!numberOfRows || numberOfRows === 0) ? Math.ceil(Math.sqrt(array.length)) : numberOfRows
  return chunk(array, gridLength)
}

const generateStream = (channel: string) => {
  return <Embed channelName={channel} />;
};

const MultiStreamGrid = ({ gridStreams }: { gridStreams: Channel[][] }) => {
  return <>
    {gridStreams.map((channels, idx) => {
      return (
        <Row
          numberOfColumns={channels.length}
          isLast={idx === gridStreams.length - 1}>
          {channels.map(channel => (
            <Video key={channel.channelName}>
              {channel.stream}
            </Video>))}
        </Row>)
    })}
  </>
}

const App = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    lastMessage,
    sendMessage
  } = useWebSocket('wss://multi-stream.than.dev/ws', {
    reconnectInterval: 5000, shouldReconnect: () => true
  });

  const [orientation] = useLocalStorage<"horizontal" | "vertical">(
    "orientation",
    "horizontal"
  );

  const [ignoreList] = useLocalStorage<string>("ignoreList", "");
  const [numberOfRows] = useLocalStorage<number>("numberOfColumns", 0);

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
    if (lastMessage) {
      const jsonMessage: WebsocketMessage = JSON.parse(lastMessage.data)

      if ('notification_type' in jsonMessage) {
        const notificationType = jsonMessage.notification_type;
        const affectedChannel = jsonMessage.channel;
        const typeToSend = notificationType === "online" ? "add" : "remove";
        dispatch({ type: typeToSend, channelName: affectedChannel })
      }

      else if ("online_channels" in jsonMessage) {
        const onlineChannels = jsonMessage.online_channels;
        dispatch({
          type: "set",
          channelNames: onlineChannels.map((channel) => ({
            channelName: channel,
            stream: generateStream(channel),
          })),
        });
      }
    }
  }, [lastMessage])

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

  const rotateChannels = () => {
    const clonedChannels = cloneDeep(state.channelNames)

    const lastElement = clonedChannels.shift()

    if (lastElement)
      clonedChannels.push(lastElement);

    dispatch({
      type: "set",
      channelNames: clonedChannels,
    });
  }

  const filteredChannels = useMemo(() => state.channelNames.filter(
    (channel) => !ignoreList.split(",").includes(channel.channelName)
  ), [ignoreList, state.channelNames])

  const gridStreams = useMemo(() => generateGrid(filteredChannels, numberOfRows)
    , [filteredChannels, numberOfRows])

  return (
    <MultiContainer>
      <Sidebar onRotateClick={rotateChannels} onSettingsClick={() => setSettingsOpen(true)} />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {filteredChannels.length === 0 ? <NoStreams /> : <StreamGrid
        orientation={orientation}
        numStreams={Math.ceil(Math.sqrt(filteredChannels.length))}
      >
        <MultiStreamGrid gridStreams={gridStreams} />
      </StreamGrid>}

    </MultiContainer>
  );
}

export default App;

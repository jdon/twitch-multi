import { TwitchEmbed } from "react-twitch-embed";

const Embed = ({ channelName }) => {
  return (
    <TwitchEmbed
      width="100%"
      height="100%"
      layout="video"
      muted={true}
      withChat={false}
      channel={channelName}
      id={channelName}
    />
  );
};

export default Embed
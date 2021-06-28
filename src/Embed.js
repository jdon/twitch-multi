import ReactTwitchEmbedVideo from "react-twitch-embed-video";

const Embed = ({ channelName }) => {
  return (
    <ReactTwitchEmbedVideo
      width="100%"
      height="100%"
      layout="video"
      channel={channelName}
      targetId={channelName}
    />
  );
};

export default Embed;

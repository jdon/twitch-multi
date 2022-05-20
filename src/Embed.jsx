import ReactPlayer from 'react-player'

const Embed = ({ channelName }) => {
  const url = `https://www.twitch.tv/${channelName}`;
  return (
    <ReactPlayer
      url={url}
      width="100%"
      height="100%"
      config={{
        twitch: {
          options: {
            layout: 'video',
            autoplay: true,
            muted: true
          }
        }
      }
      }
    />
  );
};

export default Embed
import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;

  height: 100%;
  align-items: center;
  justify-content: center;

  flex-direction: column;

  background-color: black;
`;

const Title = styled.div`
  font-weight: bold;

  color: white;
`;

const Subtitle = styled.div`
  color: grey;
  position: relative;

  @keyframes dotty {
    0% {
      content: "";
    }
    25% {
      content: ".";
    }
    50% {
      content: "..";
    }
    75% {
      content: "...";
    }
    100% {
      content: "";
    }
  }

  &:after {
    position: absolute;
    content: "";
    animation: dotty steps(1,end) 3s infinite;
  }
`;

const NoStreams = () => {
  return (
    <Container>
      <Title>No Streams Online Currently</Title>
      <Subtitle>Listening for new streams</Subtitle>
    </Container>
  );
};

export default NoStreams;

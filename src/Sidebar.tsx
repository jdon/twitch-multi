import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 70px;

  position: absolute;
  background: none;

  opacity: 0;

  transition: opacity 0.3s;
  z-index: 10;

  &:hover {
    opacity: 1;
  }
`;

const ItemTray = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  margin-left: 0.5rem;
  margin-top: 0.5rem;
`;

const Item = styled.div`
  text-align: center;
  padding: 1rem;

  font-weight: bold;
  cursor: pointer;
  background-color: #9147ff;
  color: white;
  margin: 0.2rem;

  border-radius: 20%;

  &:hover {
    background-color: #772ce8;
  }
`;

interface SidebarProps {
  onClick: (orientation: 'vertical' | 'horizontal') => void
}
const Sidebar = ({ onClick }: SidebarProps) => {
  return <Container>
    <ItemTray>
      <Item onClick={() => onClick('horizontal')}>H</Item>
      <Item onClick={() => onClick('vertical')}>V</Item>
    </ItemTray>
  </Container>
}

export default Sidebar;
import styled from "styled-components";
import SettingsIcon from './Icons/SettingsIcon';

const Container = styled.div`
  position: absolute;
  background: #00000063;

  padding: 0.5rem;

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

  color: white;

  align-items: center;
`;

interface SidebarProps {
  onSettingsClick: () => void;
}
const Sidebar = ({ onSettingsClick }: SidebarProps) => {
  return (
    <Container>
      <ItemTray>
        <SettingsIcon onClick={onSettingsClick} />
      </ItemTray>
    </Container>
  );
};

export default Sidebar;

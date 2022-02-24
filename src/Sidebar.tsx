import styled from "styled-components";
import SettingsIcon from './Icons/SettingsIcon';
import RotateIcon from "./Icons/RotateIcon";

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

  svg {
    margin-bottom: 1rem;
  }
`;

interface SidebarProps {
  onSettingsClick: () => void;
  onRotateClick: () => void;
}
const Sidebar = ({ onSettingsClick, onRotateClick }: SidebarProps) => {
  return (
    <Container>
      <ItemTray>
        <SettingsIcon onClick={onSettingsClick} />
        <RotateIcon onClick={onRotateClick} />
      </ItemTray>
    </Container>
  );
};

export default Sidebar;

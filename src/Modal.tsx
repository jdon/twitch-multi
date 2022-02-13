import styled from "styled-components";

const Container = styled.div`
  position: absolute;

  display: flex;
  justify-content: center;
  align-items: center;
  inset: 0;

  z-index: 1;

  background-color: #000000b8;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  padding: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.9), 0 0px 2px rgba(0, 0, 0, 0.9);
`;

const Box = styled.div`
  position: relative;
  color: #dedee3;
  background-color: #18181b;

  min-width: 150px;
  min-height: 100px;

  border-radius: 4px;
`;

const Content = styled.div`
  padding: 1rem;
`;

const CloseButton = styled.div`
  margin-left: auto;
  color: grey;

  font-size: 12px;

  &:hover {
    cursor: pointer;
  }
`;

interface ModalProps {
  children: React.ReactNode;
  header: string;

  onClose?: () => void;
}
const Modal = ({ children, header, onClose }: ModalProps) => {
  return (
    <Container onClick={onClose}>
      <Box onClick={(e: any) => e.stopPropagation()}>
        <Header>
          {header}
          <CloseButton onClick={onClose}>Close</CloseButton>
        </Header>
        <Content>{children}</Content>
      </Box>
    </Container>
  );
};

export default Modal;

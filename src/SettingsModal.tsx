import Modal from "./Modal";
import styled from "styled-components";
import useLocalStorage from './useLocalStorage'

const Dropdown = styled.select`
  background: none;

  padding: 4px;
  border: 1px solid #474748;
  border-radius: 4px;

  color: #dedee3;

  option {
    color: black;
  }
`;

const Label = styled.div`
  margin-right: 1rem;
`;

const Textbox = styled.input`
  background: none;
  border: 1px solid #474748;
  border-radius: 4px;
  padding: 4px;
  color: #dedee3;
`;

const Form = styled.div`
  grid-template-columns: [labels] auto [controls] 1fr;
  grid-gap: 0.8em;
  display: grid;

  > ${Label} {
    grid-column: labels;
  }

  > input,
  select {
    grid-column: controls;
  }
`;

interface SettingsModalProps {
  onClose: () => void;
  isOpen: boolean;
}
const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [orientation, setOrientation] = useLocalStorage("orientation", "horizontal");
  const [ignoreList, setIgnoreList] = useLocalStorage("ignoreList", "");

  if (!isOpen) return null;
  return (
    <Modal onClose={onClose} header="Settings">
      <Form>
        <Label>Orientation:</Label>

        <Dropdown
          value={orientation}
          onChange={(e) => setOrientation(e.currentTarget.value)}
        >
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
        </Dropdown>

        <Label>Ignore List:</Label>
        <Textbox
          placeholder="popo336"
          onChange={(e) => setIgnoreList(e.currentTarget.value)}
          value={ignoreList}
        />
      </Form>
    </Modal>
  );
};

export default SettingsModal;

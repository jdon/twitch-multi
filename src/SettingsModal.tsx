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

const Label = styled.label`
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
  const [numOfColumns, setnumOfColumns] = useLocalStorage("numberOfColumns", 0);

  const changeNumInput = (callback: (value: number) => void) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value
      const parsed = parseInt(value)

      if (value === "") {
        callback(0)
      } else if (isNaN(parsed)) {
        e.preventDefault()
      } else {
        callback(parsed)
      }
    }
  }

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} header="Settings">
      <Form>
        <Label htmlFor="orientation">Orientation:</Label>

        <Dropdown
          id="orientation"
          value={orientation}
          onChange={(e) => setOrientation(e.currentTarget.value)}
        >
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
        </Dropdown>

        <Label htmlFor="ignoreList">Ignore List:</Label>
        <Textbox
          id="ignoreList"
          placeholder="popo336"
          onChange={(e) => setIgnoreList(e.currentTarget.value)}
          value={ignoreList}
        />

        <Label htmlFor="numOfColumns">Number of columns:</Label>
        <Textbox
          id="numOfColumns"
          placeholder="0 for auto"
          onChange={changeNumInput(value => setnumOfColumns(value))}
          value={numOfColumns}
        />
      </Form>
    </Modal>
  );
};

export default SettingsModal;

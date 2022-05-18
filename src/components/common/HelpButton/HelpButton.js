import { helpIcon } from "../../../assets/icons";
import "./HelpButton.css";

function HelpButton() {
  return (
    <button className="help-button">
      <img src={helpIcon.default} alt="Help" />
    </button>
  );
}

export default HelpButton;

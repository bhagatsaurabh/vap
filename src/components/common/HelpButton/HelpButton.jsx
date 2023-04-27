import "./HelpButton.css";
import { helpIcon } from "../../../assets/icons";

function HelpButton() {
  return (
    <button className="help-button">
      <img src={helpIcon.default} alt="Help" />
    </button>
  );
}

export default HelpButton;

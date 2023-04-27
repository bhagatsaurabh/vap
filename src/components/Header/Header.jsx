import "./Header.css";
import { logoIcon } from "../../assets/icons";
import HelpButton from "../common/HelpButton/HelpButton";

function Header() {
  return (
    <header className="home-header">
      <div className="header-left">
        <img src={logoIcon.default} alt="VAP header logo" />
        <div className="header-name">
          <span className="ml-1">vAP</span>
        </div>
      </div>
      <div className="header-right">
        <HelpButton />
      </div>
    </header>
  );
}

export default Header;

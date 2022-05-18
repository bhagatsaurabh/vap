import { logoIcon } from "../../assets/icons";
import HelpButton from "../common/HelpButton/HelpButton";
import "./Header.css";

function Header() {
  return (
    <header className="home-header">
      <div className="header-left">
        <img src={logoIcon.default} alt="VAP header logo" />
      </div>
      <div className="header-right">
        <HelpButton />
      </div>
    </header>
  );
}

export default Header;

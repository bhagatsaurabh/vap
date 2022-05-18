import { githubIcon } from "../../assets/icons";
import "./Footer.css";

function Footer() {
  return (
    <footer className="home-footer">
      <div className="footer-left">
        <button>
          <img className="github-icon" src={githubIcon.default} alt="Github" />
        </button>
      </div>
      <div className="footer-right">
        <span>Copyright &copy; 2018-present | </span>
        <span style={{ whiteSpace: "nowrap" }}>Saurabh Bhagat</span>
      </div>
    </footer>
  );
}

export default Footer;

import "./Home.css";
import { helpIcon, logoDarkSmall } from "../../assets/icons";

function Home() {
  return (
    <>
      <header>
        <div className="header-left">
          <img src={logoDarkSmall.default} alt="VAP header logo" />
        </div>
        <div className="header-right">
          <img src={helpIcon.default} alt="Help" />
        </div>
      </header>
      <main></main>
      <footer></footer>
    </>
  );
}

export default Home;

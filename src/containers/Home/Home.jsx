import "./Home.css";
import vapLight from "../../assets/images/logo-light-transparent.png";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import StartButton from "../../components/common/StartButton/StartButton";
import AnimatedCover from "../../components/AnimatedCover/AnimatedCover";

function Home() {
  return (
    <>
      <Header />
      <main className="home-main">
        <div className="home-back-cover"></div>
        <AnimatedCover />
        <div className="home-cover">
          <div className="home-logo">
            <img className="cover-image" src={vapLight} alt="VAP Logo" />
            <span className="cover-name">vAP</span>
          </div>
          <p className="cover-line">Visual Audio Processor</p>
          <StartButton>Start</StartButton>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Home;

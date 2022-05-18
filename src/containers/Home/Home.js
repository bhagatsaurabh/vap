import vapCover from "../../assets/images/cover-transparent.png";
import "./Home.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import StartButton from "../../components/common/StartButton/StartButton";

function Home() {
  return (
    <>
      <Header />
      <main className="home-main">
        <div className="home-cover">
          <img className="cover-image" src={vapCover} alt="VAP Logo Cover" />
          <p className="cover-line">Visual Audio Processor</p>
          <StartButton>Start</StartButton>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Home;

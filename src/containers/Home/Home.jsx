import styles from "./Home.module.css";
import vapLight from "@/assets/images/logo-light-transparent.png";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import StartButton from "@/components/common/StartButton/StartButton";
import AnimatedCover from "@/components/AnimatedCover/AnimatedCover";

const Home = () => {
  return (
    <>
      <Header />
      <main>
        <AnimatedCover />
        <div className={styles.cover}>
          <div className={styles.brand}>
            <img src={vapLight} alt="vAP Logo" />
            <span>vAP</span>
          </div>
          <p>Visual Audio Processor</p>
          <StartButton>Start</StartButton>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Home;

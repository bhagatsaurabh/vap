import { useRef, useState } from "react";

import styles from "./Home.module.css";
import vapLight from "@/assets/images/logo-light-transparent.png";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import AnimatedCover from "@/components/AnimatedCover/AnimatedCover";
import Button from "@/components/common/Button/Button";
import ScrollHint from "@/components/ScrollHint/ScrollHint";
import { useAfterMount } from "@/misc/custom-hooks";
import { clamp, debounce, normalize, roundTo } from "@/misc/utils";
import { logo } from "@/assets/icons";
import Feature from "@/components/Feature/Feature";

const Home = () => {
  const sections = useRef([]);
  const mainEl = useRef(null);
  const [opacities, setOpacities] = useState([1, 1, 1]);

  const scrollListener = debounce(() => {
    const newOpacities = sections.current.map((section, index) =>
      roundTo(
        1 -
          normalize(
            clamp(
              Math.abs(section.offsetTop - section.clientHeight * (index + 1)),
              0,
              section.clientHeight
            ),
            0,
            section.clientHeight
          ),
        2
      )
    );

    setOpacities(newOpacities);
  }, 10);

  useAfterMount(
    () => {
      mainEl.current.addEventListener("scroll", scrollListener, false);
    },
    () => {
      mainEl.current.removeEventListener("scroll", scrollListener);
    }
  );

  return (
    <>
      <Header
        left={
          <>
            <img src={logo} alt="vAP header logo" />
            <span className="ml-1">vAP</span>
          </>
        }
      />
      <main ref={mainEl}>
        <AnimatedCover />
        <section>
          <div className={styles.cover}>
            <div className={styles.brand}>
              <img src={vapLight} alt="vAP Logo" />
              <span>vAP</span>
            </div>
            <p>Visual Audio Processor</p>
            <Button icon="flow" iconLeft accent="dark" size={1.2}>
              My Flows
            </Button>
            <ScrollHint />
          </div>
        </section>
        <section style={{ opacity: opacities[0] }} ref={(el) => (sections.current[0] = el)}>
          <Feature left={<div className={styles.placeholder}></div>} right={<span>Create</span>} />
        </section>
        <section style={{ opacity: opacities[1] }} ref={(el) => (sections.current[1] = el)}>
          <Feature left={<span>Create</span>} right={<div className={styles.placeholder}></div>} />
        </section>
        <section style={{ opacity: opacities[2] }} ref={(el) => (sections.current[2] = el)}>
          <Feature
            left={<div className={styles.placeholder}></div>}
            right={<span>Export & Share</span>}
          />
        </section>
      </main>
      <Footer
        left={
          <a href="https://github.com/saurabh-prosoft/vap" target="_blank" rel="noreferrer">
            <Button className="fs-0" icon="github" size={2} iconLeft accent="dark" />
          </a>
        }
        right={
          <>
            <span>Copyright &copy; 2018-present | </span>
            <span className="ws-no-wrap">Saurabh Bhagat</span>
          </>
        }
      />
    </>
  );
};

export default Home;

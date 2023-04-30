import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import styles from "./Home.module.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import AnimatedCover from "@/components/AnimatedCover/AnimatedCover";
import Button from "@/components/common/Button/Button";
import ScrollHint from "@/components/ScrollHint/ScrollHint";
import { clamp, debounce, normalize, roundTo } from "@/misc/utils";
import Feature from "@/components/Feature/Feature";
import showcase1 from "@/assets/images/showcase-1.gif";
import showcase2 from "@/assets/images/showcase-2.gif";
import showcase3 from "@/assets/images/showcase-3.gif";
import ScrollToTop from "@/components/common/ScrollToTop/ScrollToTop";
import InteractiveLogo from "@/components/common/InteractiveLogo/InteractiveLogo";
import Brand from "@/components/common/Brand/Brand";
import Footnote from "@/components/Footnote/Footnote";

const Home = () => {
  const sections = useRef([]);
  const mainEl = useRef(null);
  const coverEl = useRef(null);
  const [showFloat, setShowFloat] = useState(false);
  const [opacities, setOpacities] = useState([1, 1, 1]);
  const floatClasses = [styles.floating];
  const floatBrandClasses = [styles["floating-brand"]];
  const [showHint, setShowHint] = useState(true);

  if (showFloat) {
    floatBrandClasses.push(styles.show);
    floatClasses.push(styles.show);
  }

  const provideAnchor = () => coverEl.current;

  const scrollListener = debounce(() => {
    setShowHint(false);

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

  useEffect(() => {
    const mainElRef = mainEl.current;
    mainElRef.addEventListener("scroll", scrollListener, false);
    const observer = new IntersectionObserver(([entry]) => setShowFloat(!entry.isIntersecting), {
      root: null,
      threshold: 0.1,
    });
    observer.observe(coverEl.current);

    return () => {
      mainElRef.removeEventListener("scroll", scrollListener);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <Header left={<InteractiveLogo />} />
      <main ref={mainEl}>
        <aside className={floatClasses.join(" ")}>
          <ScrollToTop anchor={provideAnchor} show={showFloat} />
          <Link to="/flows">
            <Button icon="flow" iconLeft accent="dark" size={1.2}>
              My Flows
            </Button>
          </Link>
        </aside>
        <aside className={floatBrandClasses.join(" ")}>
          <Brand size={2} fixed />
        </aside>
        <AnimatedCover />
        <section>
          <div ref={coverEl} className={styles.cover}>
            <Brand size={8} />
            <p>Visual Audio Processor</p>
            <Link to="/flows">
              <Button icon="flow" iconLeft accent="dark" size={1.2}>
                My Flows
              </Button>
            </Link>
            <ScrollHint show={showHint} />
          </div>
        </section>
        <section style={{ opacity: opacities[0] }} ref={(el) => (sections.current[0] = el)}>
          <Feature
            left={<img src={showcase1} className={styles.showcase} />}
            right={
              <div className={[styles.content, styles.left].join(" ")}>
                <span className={["fs-2", styles.ftext].join(" ")}>Create</span>
                <span className={[styles.fdesc].join(" ")}>
                  Create your own flows and experiment !
                </span>
              </div>
            }
          />
        </section>
        <section style={{ opacity: opacities[1] }} ref={(el) => (sections.current[1] = el)}>
          <Feature
            left={
              <div className={[styles.content, styles.right].join(" ")}>
                <span className={["fs-2", styles.ftext].join(" ")}>Save</span>
                <span className={[styles.fdesc].join(" ")}>
                  Save your creation anytime and access offline
                </span>
              </div>
            }
            right={<img src={showcase2} className={styles.showcase} />}
          />
        </section>
        <section style={{ opacity: opacities[2] }} ref={(el) => (sections.current[2] = el)}>
          <Feature
            left={<img src={showcase3} className={styles.showcase} />}
            right={
              <div className={[styles.content, styles.left].join(" ")}>
                <span className={["fs-2", styles.ftext].join(" ")}>Export & Share</span>
                <span className={[styles.fdesc].join(" ")}>Export, download and share !</span>
              </div>
            }
          />
        </section>
      </main>
      <Footer
        left={
          <a className="o-0p6" href="https://github.com/saurabh-prosoft/vap" target="_blank">
            <Button className="fs-0" icon="github" size={2} iconLeft accent="dark" fit />
          </a>
        }
        right={<Footnote />}
      />
    </>
  );
};

export default Home;

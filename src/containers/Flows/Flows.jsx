import Header from "@/components/Header/Header";
import styles from "./Flows.module.css";
import Footer from "@/components/Footer/Footer";
import InteractiveLogo from "@/components/common/InteractiveLogo/InteractiveLogo";
import Brand from "@/components/common/Brand/Brand";
import Button from "@/components/common/Button/Button";
import Footnote from "@/components/Footnote/Footnote";
import { useRef } from "react";

const Flows = () => {
  const mainEl = useRef(null);
  const provideRef = () => mainEl.current;

  return (
    <>
      <Header
        left={<InteractiveLogo />}
        center={<Brand size={2} fixed />}
        right={
          <a className="o-0p6" href="https://github.com/saurabh-prosoft/vap" target="_blank">
            <Button className="fs-0" icon="github" size={2} iconLeft accent="dark" fit />
          </a>
        }
        fixed
        dynamic
        reference={provideRef}
      />
      <main className={styles.main}>
        <div ref={mainEl}>My Flows</div>
        <div>My Flows</div>
        <div>My Flows</div>
        <div>My Flows</div>
        <div>My Flows</div>
        <div>My Flows</div>
        <div>My Flows</div>
        <div>My Flows</div>
        <div>My Flows</div>
        <div>My Flows</div>
        <div>My Flows</div>
        <div>My Flows</div>
      </main>
      <Footer left={<Footnote />} />
    </>
  );
};

export default Flows;

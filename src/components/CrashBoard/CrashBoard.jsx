import { useEffect } from "react";
import { Link, useRouteError } from "react-router-dom";

import styles from "./CrashBoard.module.css";
import Icon from "../common/Icon/Icon";
import Button from "../common/Button/Button";
import Brand from "../common/Brand/Brand";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Footnote from "../Footnote/Footnote";

const CrashBoard = () => {
  const error = useRouteError();

  useEffect(() => {
    console.log(error);
  }, []);

  return (
    <>
      <Header fixed transparent left={<Brand size={2} fixed />} />
      <main className={styles.crash}>
        <section className={styles.title}>
          <span>Something went wrong</span>
          <Icon size={3} name="crash" />
        </section>
        <section className={styles.desc}>Whoa ! This is unexpected</section>
        <section className={styles.controls}>
          <Link to="/">
            <Button icon="back" iconLeft rect>
              Take me back
            </Button>
          </Link>
          <Link
            to="https://github.com/bhagatsaurabh/vap/issues/new?title=The%20app%20crashed%20!&body=Please%20add%20details%20here..."
            target="_blank"
          >
            <Button icon="bug" iconLeft rect>
              File a bug
            </Button>
          </Link>
          <Link
            to="https://github.com/bhagatsaurabh/flow-connect/issues/new?title=The%20app%20crashed%20!&body=Please%20add%20details%20here..."
            target="_blank"
          >
            <Button icon="bug" iconLeft rect>
              File an editor bug
            </Button>
          </Link>
        </section>
      </main>
      <Footer
        left={
          <a
            className="o-0p6"
            href="https://github.com/bhagatsaurabh/vap"
            target="_blank"
            rel="noreferrer"
          >
            <Button className="fs-0" icon="github" size={2} iconLeft accent="dark" fit />
          </a>
        }
        right={<Footnote />}
        fixed
        transparent
      />
    </>
  );
};

export default CrashBoard;

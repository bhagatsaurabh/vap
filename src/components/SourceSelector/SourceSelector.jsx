import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Tabs from "../common/Tabs/Tabs";
import styles from "./SourceSelector.module.css";
import { getSamples } from "@/store/actions/samples";
import Button from "../common/Button/Button";

const SourceSelector = ({ onSelect }) => {
  const samples = useSelector((state) => state.samples);
  const dispatch = useDispatch();
  const [active, setActive] = useState(null);
  const [fetchSample, setFetchSample] = useState(null);
  const [prwSample, setPrwSample] = useState(null);

  const init = async () => {
    await dispatch(getSamples());
  };

  useEffect(() => {
    init();
  }, []);
  useEffect(() => {
    if (samples?.length) {
      setActive(samples[0].name);
    }
  }, [samples]);

  const handleTabChange = (tab) => {
    setActive(tab);
  };
  const handleSampleSelect = async (sample) => {
    setFetchSample(sample);
    const blob = await (await fetch(sample.url)).blob();
    setFetchSample(null);
    onSelect(
      new File([blob], decodeURI(sample.url.substring(sample.url.lastIndexOf("/") + 1)), {
        type: blob.type,
      })
    );
  };

  return (
    <div className={styles.sourceselect}>
      <Tabs
        active={active}
        headers={samples.map((cat) => cat.name)}
        onChange={(tab) => handleTabChange(tab)}
      >
        <div className={[styles.samplepreview, prwSample ? styles.open : ""].join(" ")}>
          <h3>Preview</h3>
          <h4>Sample: {prwSample?.name}</h4>
          {<audio className="mb-1" controls src={prwSample?.url}></audio>}
          <br />
          <Button
            disabled={fetchSample}
            busy={fetchSample}
            icon="use"
            iconLeft
            onClick={() => handleSampleSelect(prwSample)}
            size={1}
            rect
          >
            {fetchSample ? "Downloading" : "Use"}
          </Button>
          {!fetchSample && (
            <Button
              onClick={() => setPrwSample(null)}
              size={1.5}
              className={[styles.close, "fs-0"].join(" ")}
              icon="close"
              fit
            />
          )}
        </div>
        <div className={[styles.samplelist, prwSample ? styles.pb : ""].join(" ")}>
          {active &&
            samples
              .find((cat) => cat.name === active)
              .samples.map((sample) => (
                <button
                  disabled={fetchSample}
                  key={sample.name}
                  onClick={() => setPrwSample(sample)}
                  className={[
                    styles.sample,
                    fetchSample === sample ? styles.fetch : "",
                    prwSample === sample ? styles.preview : "",
                  ].join(" ")}
                >
                  <h4>{sample.name}</h4>
                </button>
              ))}
        </div>
      </Tabs>
    </div>
  );
};

export default SourceSelector;

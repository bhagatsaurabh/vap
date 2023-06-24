import PropTypes from "prop-types";

import Button from "../common/Button/Button";
import styles from "./EditorControls.module.css";

const EditorControls = ({ state, onPlay, onStop, onReplay }) => {
  const loading = state === "loading";
  const playing = state === "playing";
  const stopped = state === "stopped";

  return (
    <aside data-tour="5" className={styles.controls}>
      <Button disabled={playing || loading} onClick={onPlay} icon="play" size={1} flat rect />
      <Button disabled={stopped || loading} onClick={onStop} icon="stop" size={1} flat rect />
      <Button disabled={loading} onClick={onReplay} icon="replay" size={1} flat rect />
    </aside>
  );
};

EditorControls.propTypes = {
  state: PropTypes.string,
  onPlay: PropTypes.func,
  onStop: PropTypes.func,
  onReplay: PropTypes.func,
};

export default EditorControls;

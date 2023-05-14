import Button from "../common/Button/Button";
import styles from "./EditorControls.module.css";

const EditorControls = ({ state, onPlay, onStop, onReplay }) => {
  const loading = state === "loading";
  const playing = state === "playing";
  const stopped = state === "stopped";

  return (
    <aside className={styles.controls}>
      <Button disabled={playing || loading} onClick={onPlay} icon="play" size={1} flat rect />
      <Button disabled={stopped || loading} onClick={onStop} icon="stop" size={1} flat rect />
      <Button disabled={loading} onClick={onReplay} icon="replay" size={1} flat rect />
    </aside>
  );
};

export default EditorControls;

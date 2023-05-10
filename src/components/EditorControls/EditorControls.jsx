import Button from "../common/Button/Button";
import styles from "./EditorControls.module.css";

const EditorControls = ({ state, onPlay, onStop, onReplay }) => {
  const playing = state === "playing";
  const stopped = state === "stopped";

  return (
    <aside className={styles.controls}>
      <Button disabled={playing} onClick={onPlay} icon="play" size={1} flat />
      <Button disabled={stopped} onClick={onStop} icon="stop" size={1} flat />
      <Button onClick={onReplay} icon="replay" size={1} flat />
    </aside>
  );
};

export default EditorControls;

import { useRef, useState } from "react";
import { useAfterMount } from "../../utils/custom-hooks";
import { Animation } from "../../utils/animated-cover";

import "./AnimatedCover.css";

function AnimatedCover() {
  const canvasEl = useRef(null);
  const context = useRef(null);
  const [frame, setFrame] = useState(-1);
  useAfterMount(
    () => {
      context.current = canvasEl.current.getContext("2d");
      const animation = new Animation(canvasEl.current);
      window.addEventListener("resize", resize.bind(this, canvasEl.current, animation), false);
      resize(canvasEl.current, animation);
      const frameId = requestAnimationFrame(
        render.bind(this, context.current, canvasEl.current, animation)
      );
      setFrame(frameId);
    },
    () => {
      window.removeEventListener("resize", resize);
    }
  );

  return <canvas ref={canvasEl} className="animated-cover"></canvas>;
}

function resize(canvas, animation) {
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;

  animation.resize(canvas.width, canvas.height);
}

function render(context, canvas, animation) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  animation.render(context);
  requestAnimationFrame(render.bind(this, context, canvas, animation));
}

export default AnimatedCover;

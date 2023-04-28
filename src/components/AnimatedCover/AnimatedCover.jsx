import { useRef } from "react";

import "./AnimatedCover.css";
import { useAfterMount } from "@/misc/custom-hooks";
import { Animation } from "@/misc/animated-cover";
import { debounce, resizeAnimation } from "@/misc/utils";

let frameId = 0;

const AnimatedCover = () => {
  const canvasEl = useRef(null);
  const context = useRef(null);

  useAfterMount(
    () => {
      context.current = canvasEl.current.getContext("2d");
      const animation = new Animation(canvasEl.current);
      window.addEventListener(
        "resize",
        debounce(resizeAnimation.bind(this, canvasEl.current, animation), 100),
        false
      );
      resizeAnimation(canvasEl.current, animation);
      frameId = requestAnimationFrame(
        render.bind(this, context.current, canvasEl.current, animation)
      );
    },
    () => {
      window.removeEventListener("resize", resizeAnimation);
      cancelAnimationFrame(frameId);
    }
  );

  return (
    <>
      <div className="back-cover"></div>
      <canvas ref={canvasEl} className="animated-cover"></canvas>
    </>
  );
};

const render = (context, canvas, animation) => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  animation.render(context);
  frameId = requestAnimationFrame(render.bind(this, context, canvas, animation));
};

export default AnimatedCover;

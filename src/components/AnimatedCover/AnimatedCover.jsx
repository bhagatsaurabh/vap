import { useEffect, useRef } from "react";

import "./AnimatedCover.css";
import { Animation } from "@/misc/animated-cover";
import { debounce, resizeAnimation } from "@/misc/utils";

let frameId = 0;

const AnimatedCover = () => {
  const canvasEl = useRef(null);

  useEffect(() => {
    const canvas = canvasEl.current;
    const context = canvas.getContext("2d");
    const animation = new Animation(canvas);

    const resizeListener = debounce(resizeAnimation.bind(this, canvas, animation), 100);
    window.addEventListener("resize", resizeListener, false);
    resizeAnimation(canvas, animation);

    frameId = requestAnimationFrame(render.bind(this, context, canvas, animation));

    return () => {
      window.removeEventListener("resize", resizeListener);
      cancelAnimationFrame(frameId);
    };
  }, []);

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

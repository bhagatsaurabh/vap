import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import Tour from "reactour";
import PropTypes from "prop-types";

import { tourSteps } from "@/misc/tour";

const Walkthrough = ({ show }) => {
  const [currStep, setCurrStep] = useState(0);
  const listeners = useRef([]);
  const dispatch = useDispatch();

  const handleStepChange = (step) => {
    const currStepData = tourSteps[step];
    if (currStepData?.waitFor) {
      let listener;
      if (currStepData.delay) {
        listener = () => setTimeout(() => handleTourNext(step), currStepData.delay);
      } else {
        listener = () => handleTourNext();
      }
      const el = document.querySelector(currStepData.selector);
      el.addEventListener(currStepData.waitFor, listener);
      listeners.current.push({ el, type: currStepData.waitFor, listener });
    }
    if (step === tourSteps.length - 1) {
      dispatch({ type: "preference/set", payload: { tour: false } });
    }

    setCurrStep(step);
  };
  const handleTourNext = (step) => setCurrStep(step + 1);
  const removeListeners = () =>
    listeners.current.forEach((l) => {
      l.el.removeEventListener(l.type, l.listener);
    });

  const popListener = useCallback(() => dispatch({ type: "tour/set-state", payload: "close" }), []);

  useEffect(() => {
    window.addEventListener("popstate", popListener);
    return () => {
      window.removeEventListener("popstate", popListener);
      removeListeners();
    };
  }, []);

  return (
    <Tour
      getCurrentStep={(step) => handleStepChange(step)}
      goToStep={currStep}
      prevButton={<br />}
      nextStep={() => handleTourNext(currStep)}
      accentColor="#414041"
      steps={tourSteps}
      showButtons={!tourSteps[currStep].disableNav}
      disableKeyboardNavigation={!!tourSteps[currStep].disableNav}
      disableDotsNavigation={true}
      showNavigation={!tourSteps[currStep].disableNav}
      isOpen={show}
      onRequestClose={() => dispatch({ type: "tour/set-state", payload: "close" })}
      lastStepNextButton={<span className="tourclose">Close</span>}
    />
  );
};

Walkthrough.propTypes = {
  show: PropTypes.bool,
};

export default Walkthrough;

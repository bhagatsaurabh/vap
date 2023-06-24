import PropTypes from "prop-types";

import "./StartButton.css";

const StartButton = ({ children }) => {
  return <button className="home-start">{children}</button>;
};

StartButton.propTypes = {
  children: PropTypes.node,
};

export default StartButton;

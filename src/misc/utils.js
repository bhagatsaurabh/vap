export const rand = (min, max) => {
  const buf = new Uint32Array(1);
  window.crypto.getRandomValues(buf);
  return denormalize(buf[0] / (0xffffffff + 1), min, max);
};

export const denormalize = (norm, min, max) => {
  return norm * (max - min) + min;
};

export const normalize = (value, min, max) => {
  return (value - min) / (max - min);
};

export const debounce = (func, timeout = 100) => {
  let handle;
  return (...args) => {
    clearTimeout(handle);
    handle = setTimeout(() => func.apply(this, args), timeout);
  };
};

export const project = (x, y, z, config) => {
  const projectedScale = config.PERSPECTIVE / (config.PERSPECTIVE + z);
  return {
    x: x * projectedScale + config.PROJECTION_CX,
    y: y * projectedScale + config.PROJECTION_CY,
  };
};

export const resizeAnimation = (canvas, animation) => {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;

  animation.resize(canvas.width, canvas.height);
};

export const flip = (input) => {
  return [input[1], input[0]];
};

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

export const roundTo = (value, decimalPlaces) => {
  decimalPlaces = Math.max(decimalPlaces, 1);
  const base = 10 * decimalPlaces;
  return Math.round((value + Number.EPSILON) * base) / base;
};

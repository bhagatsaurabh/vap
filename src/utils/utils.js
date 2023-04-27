export const getRandom = (min, max) => {
  return denormalize(Math.random(), min, max);
};

export const denormalize = (norm, min, max) => {
  return norm * (max - min) + min;
};

export const normalize = (value, min, max) => {
  return (value - min) / (max - min);
};

export const project = (x, y, z, config) => {
  const projectedScale = config.PERSPECTIVE / (config.PERSPECTIVE + z);
  return {
    x: x * projectedScale + config.PROJECTION_CX,
    y: y * projectedScale + config.PROJECTION_CY,
  };
};

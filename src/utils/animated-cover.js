import { getRandom } from "./utils";
import { Wave } from "./wave";

export class Animation {
  constructor(canvas) {
    this.PERSPECTIVE = canvas.width * 2 * 0.8;
    this.PROJECTION_CX = (canvas.width * 2) / 2;
    this.PROJECTION_CY = canvas.height / 2;

    this.noOfWaves = 5;

    this.waves = [];

    const zGap = (canvas.width * 2) / 2 / this.noOfWaves;

    for (let i = 0; i < this.noOfWaves; i += 1) {
      this.waves.push(
        new Wave(
          i,
          getRandom(20 + i * 5, 40 + i * 5),
          `rgba(255, 255, 255, ${Math.abs(1 - ((zGap * i * 2) / canvas.width) * 2)})`,
          zGap * i,
          getRandom(0.01, 0.03)
        )
      );
    }
  }

  resize(w, h) {
    this.PERSPECTIVE = w * 2 * 0.8;
    this.PROJECTION_CX = (w * 2) / 2;
    this.PROJECTION_CY = h / 2;

    this.waves.forEach((wave) => {
      wave.resize(w * 2, h, (w * 2) / 2 / this.noOfWaves);
    });
  }

  render(context) {
    this.waves.forEach((wave) => {
      wave.render(context, {
        PERSPECTIVE: this.PERSPECTIVE,
        PROJECTION_CX: this.PROJECTION_CX,
        PROJECTION_CY: this.PROJECTION_CY,
      });
    });
  }
}

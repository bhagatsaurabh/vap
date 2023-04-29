import { WaveParticle } from "./wave-particle";
import { denormalize, rand, normalize, project } from "./utils";
import { Particle } from "./particle";

export class Wave {
  constructor(index, noOfPoints, color, z, particleDensity) {
    this.index = index;
    this.noOfPoints = noOfPoints;
    this.points = [];
    this.z = z;
    this.color = color;
    this.debug = false;
    this.particleDensity = particleDensity;
  }

  resize(w, h, zGap) {
    this.w = w;
    this.h = h;

    this.color = `rgba(255, 255, 255, ${Math.abs(1 - (zGap * this.index * 2) / w)})`;
    this.z = zGap * this.index;
    this.blur = Math.round(denormalize(normalize(this.z, 0, this.w / 2), 0, 50));

    this.cX = 0;
    this.cY = Math.round((Math.random() - 0.5) * h);
    this.noOfPoints = rand(20 + this.index * 5, 40 + this.index * 5);

    this.pointGap = w / (this.noOfPoints - 1);

    this.init();
  }

  init() {
    this.points = [];
    this.particles = [];

    let x = -this.w;
    let a = this.w / this.h;

    for (let i = 0; i < this.noOfPoints; i += 1) {
      this.points.push(
        new WaveParticle(
          this.index + i,
          x,
          this.cY,
          this.z,
          a > 1 ? rand(16, 64) : rand(8, 32),
          denormalize(normalize(this.z, 0, this.w / 2), 0.02, 0.005)
        )
      );
      x += this.pointGap;
    }

    for (let i = 0; i < Math.round(this.w * this.particleDensity); i += 1) {
      const rotSpeed = denormalize(normalize(this.z, 0, this.w / 2), 0.02, 0.005);
      this.particles.push(
        new Particle(
          rand(-this.w / 2, 1.5 * this.w),
          rand(this.cY - 5, this.cY + 5),
          this.z,
          rand(0.2, 1),
          this.color,
          a > 1 ? rand(16, 64) : rand(8, 32),
          rotSpeed,
          rand(rotSpeed * 10, rotSpeed * 100)
        )
      );
    }
  }

  render(context, config) {
    context.shadowBlur = this.blur;
    context.shadowColor = "#fff";

    context.beginPath();
    context.strokeStyle = this.color;
    if (this.debug) context.fillStyle = "#fff";

    let prevX = this.points[0].x;
    let prevY = this.points[0].y;
    let prevZ = this.points[0].z;

    let prevProjected = project(prevX, prevY, prevZ, config);
    context.moveTo(prevProjected.x, prevProjected.y);
    if (this.debug) context.fillRect(prevProjected.x - 2, prevProjected.y - 2, 4, 4);

    for (let i = 1; i < this.noOfPoints; i += 1) {
      if (i < this.noOfPoints - 1) {
        this.points[i].update();
      }

      const cX = (prevX + this.points[i].x) / 2;
      const cY = (prevY + this.points[i].y) / 2;

      let projected = project(cX, cY, this.points[i].z, config);
      if (this.debug) context.fillRect(projected.x - 2, projected.y - 2, 4, 4);
      prevProjected = project(prevX, prevY, prevZ, config);
      context.quadraticCurveTo(prevProjected.x, prevProjected.y, projected.x, projected.y);

      prevX = this.points[i].x;
      prevY = this.points[i].y;
      prevZ = this.points[i].z;
    }

    prevProjected = project(prevX, prevY, prevZ, config);
    context.lineTo(prevProjected.x, prevProjected.y);
    if (this.debug) context.fillRect(prevProjected.x - 2, prevProjected.y - 2, 4, 4);
    context.stroke();

    this.particles.forEach((particle) => particle.render(context, config, this.w, this.h));
  }
}

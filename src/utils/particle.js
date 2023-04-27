import { project } from "./utils";

export class Particle {
  constructor(x, y, z, radius, color, amp, rotSpeed, speed) {
    this.x = x;
    this.curr = x;
    this.y = y;
    this.offsetY = y;
    this.z = z;
    this.radius = radius;
    this.rotSpeed = rotSpeed;
    this.vx = speed;
    this.color = color;
    this.amplitude = amp;
  }

  update(w, h) {
    /* this.x -= this.vx;
    if (this.x < -w / 2) this.x = 1.5 * w;

    this.curr -= this.rotSpeed;
    if (this.curr < -w / 2) this.curr = 1.5 * w; */
    this.x += this.vx;
    if (this.x > 1.5 * w) this.x = -w / 2;

    this.curr += this.rotSpeed;
    if (this.curr > 1.5 * w) this.curr = -w / 2;
    this.y = this.offsetY + Math.sin(this.curr) * this.amplitude;
  }

  render(context, config, w, h) {
    this.update(w, h);

    let { x, y } = project(this.x, this.y, this.z, config);
    x -= w;
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(x, y, this.radius, 0, 2 * Math.PI);
    context.stroke();
    context.closePath();
    context.fill();
  }
}

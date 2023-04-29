export class WaveParticle {
  constructor(index, x, y, z, amp, speed) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.offsetY = y;

    this.speed = speed;
    this.curr = index;
    this.amplitude = amp;
  }

  update() {
    this.curr += this.speed;
    this.y = this.offsetY + Math.sin(this.curr) * this.amplitude;
  }
}

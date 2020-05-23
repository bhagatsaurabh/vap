window.requestAnimationFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
        if (typeof radius === "undefined") {
            radius = 5;
        }
        this.beginPath();
        this.moveTo(x - (width / 2) + radius, y - (height / 2));
        this.lineTo(x - (width / 2) + width - radius, y - (height / 2));
        this.quadraticCurveTo(x - (width / 2) + width, y - (height / 2), x - (width / 2) + width, y - (height / 2) + radius);
        this.lineTo(x - (width / 2) + width, y - (height / 2) + height - radius);
        this.quadraticCurveTo(x - (width / 2) + width, y - (height / 2) + height, x - (width / 2) + width - radius, y - (height / 2) + height);
        this.lineTo(x - (width / 2) + radius, y - (height / 2) + height);
        this.quadraticCurveTo(x - (width / 2), y - (height / 2) + height, x - (width / 2), y - (height / 2) + height - radius);
        this.lineTo(x - (width / 2), y - (height / 2) + radius);
        this.quadraticCurveTo(x - (width / 2), y - (height / 2), x - (width / 2) + radius, y - (height / 2));
        this.closePath();
    }
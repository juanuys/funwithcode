'use strict';

function start() {
  animate = true;

  ctx.lineWidth = 10;
  ctx.font = '48px serif';

  var wait = 0;
  var count = 0;

  function step() {
    if (!animate) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'hsla(' + count + ', 100%, 50%, 1.0)';
    ctx.beginPath();

    var x = canvas.width / 2;
    var y = canvas.height / 2;

    ctx.moveTo(x - 200, y - 100);

    ctx.lineTo(x, y + 100);
    ctx.lineTo(x + 200, y);

    ctx.stroke();

    ctx.fillText(count, x, y);

    wait++;
    if (wait > 60) {
      count++;
      if (count === 360) {
        wait = 0;
      }
    }

    window.requestAnimationFrame(step);
  }

  window.requestAnimationFrame(step);
}
'use strict';

function start() {
  animate = true;

  ctx.lineWidth = 10;
  ctx.font = '48px serif';

  var count = 0;

  function step() {
    if (!animate) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'hsla(' + count + ', 100%, 50%, 1.0)';
    ctx.beginPath();

    var x = canvas.width / 2;
    var y = canvas.height / 2;

    ctx.moveTo(x - 200, y - 100);

    var yCount = Math.sin((Math.PI / 180) * count)
    ctx.lineTo(x, y + yCount * 100);
    ctx.lineTo(x + 200, y);

    ctx.stroke();

    count++;
    if (count === 361) {
      count = 0;
    }

    window.requestAnimationFrame(step);
  }

  window.requestAnimationFrame(step);
}
'use strict';

function start() {
  ctx.lineWidth = 10;
  ctx.strokeStyle = 'hsla(180, 100%, 50%, 1.0)';
  ctx.beginPath();

  var x = canvas.width / 2;
  var y = canvas.height / 2;

  // pen down
  ctx.moveTo(x - 100, y - 100);

  ctx.lineTo(x + 100, y + 100);

  ctx.stroke();
}
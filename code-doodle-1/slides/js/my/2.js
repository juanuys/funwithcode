'use strict';

function start() {
  ctx.lineWidth = 10;
  ctx.strokeStyle = 'hsla(180, 100%, 50%, 1.0)';
  ctx.beginPath();

  var x = canvas.width / 2;
  var y = canvas.height / 2;

  ctx.moveTo(x - 200, y - 100);

  ctx.lineTo(x, y + 100);
  ctx.lineTo(x + 200, y);

  ctx.stroke();
}
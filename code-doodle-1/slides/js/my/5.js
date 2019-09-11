'use strict';

function start() {
  animate = true;

  var spacing = 20;
  // console.log(canvas.height) // e.g. 1440
  var numOfLines = canvas.height / spacing;
  // console.log(numOfLines) // e.g. 72

  var startOffset = spacing / 2;
  var quarter = (canvas.width - spacing) / 4;

  ctx.lineWidth = 10;
  var startTime = new Date().getTime();
  var counter = 0;
  var hue1 = 180; // cyan
  var hue2 = 300; // magenta
  var alpha = 0.4;

  function line(diff, n, hue) {

    for (let y = 0; y < numOfLines; y++) {

      // yDiv will be a value between 0 and 1 (from first row to last)
      var yDiv = y / numOfLines;

      var firstYShift = Math.sin(yDiv * Math.PI * 6) * (Math.sin(diff * n) * 31);
      var secondYShift = Math.sin(yDiv * Math.PI * 5) * (Math.sin(diff / 873) * 37);
      var thirdYShift = Math.sin(yDiv * Math.PI * 4) * (Math.sin(diff / 999) * 43);

      var firstXShift = Math.sin(yDiv * Math.PI * 3) * (Math.sin(diff / 1213) * 77);
      var secondXShift = Math.sin(yDiv * Math.PI * 2) * (Math.sin(diff / 1303) * 91);
      var thirdXShift = Math.sin(yDiv * Math.PI * 1) * (Math.sin(diff / 1400) * 101);

      hue += 2;
      ctx.strokeStyle = 'hsla(' + hue + ', 100%, 50%, ' + alpha + ')';
      ctx.beginPath();
      ctx.moveTo(startOffset, y * spacing + startOffset);
      ctx.lineTo(startOffset + quarter + firstXShift, y * spacing + startOffset + firstYShift);
      ctx.lineTo(startOffset + quarter * 2 + secondXShift, y * spacing + startOffset + secondYShift);
      ctx.lineTo(startOffset + quarter * 3 + thirdXShift, y * spacing + startOffset + thirdYShift);
      ctx.lineTo(canvas.width - startOffset, y * spacing + startOffset);
      ctx.stroke();
    }
  }

  function step() {
    if (!animate) return;
    if (!isInViewport(canvas)) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var diff = new Date().getTime() - startTime;

    line(diff, 0.0001, hue1);

    diff += counter + 123;
    line(diff, 0.001, hue2);

    hue1 += 1;
    hue2 += 0.1;
    counter += 1;

    window.requestAnimationFrame(step);
  }

  window.requestAnimationFrame(step);
}

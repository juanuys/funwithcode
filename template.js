var canvas = document.getElementById('canvas');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
var ctx = canvas.getContext('webgl');

var animate = null;


function isInViewport(elem) {
  var bounding = elem.getBoundingClientRect();
  //  If the bottom is in view but the top isn't then it's visible
  return bounding.bottom >= 0 && bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) || bounding.top >= 0 && bounding.top <= (window.innerHeight || document.documentElement.clientHeight);
};

function stop() {
  animate = false;
}

function start() {
  animate = true;

  function step() {
    if (!animate) return;
    if (!isInViewport(canvas)) return;

    // code here

    window.requestAnimationFrame(step);
  }

  window.requestAnimationFrame(step);
};

window.addEventListener('resize', function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  stop();
  start();
});

start();
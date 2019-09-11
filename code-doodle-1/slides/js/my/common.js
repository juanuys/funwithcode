'use strict';

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event) {
  switch (event.data) {
    case "slide:start": {
      start()
      break
    }
    case "slide:stop": {
      stop()
      break
    }
  }
}

var isInViewport = function isInViewport(elem) {
	var bounding = elem.getBoundingClientRect();
	//  If the bottom is in view but the top isn't then it's visible
	return bounding.bottom >= 0 && bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) || bounding.top >= 0 && bounding.top <= (window.innerHeight || document.documentElement.clientHeight);
};

var canvas = document.getElementById('doodle');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var ctx = canvas.getContext('2d');

var animate = null;

function stop() {
  animate = false;
}

window.addEventListener('resize', function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  stop();
  start();
});
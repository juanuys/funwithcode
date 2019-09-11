'use strict';

Reveal.initialize({
	controls: false,
	progress: false,
	hash: true,
	preloadIframes: false,
	transition: 'fade',
	center: false,
	dependencies: [
		{ src: 'plugin/markdown/marked.js' },
		{ src: 'plugin/markdown/markdown.js' },
		{ src: 'plugin/notes/notes.js', async: true },
		{ src: 'plugin/highlight/highlight.js', async: true }
	],

	width: "100%",
	height: "100%",
	margin: 0,
	minScale: 1,
	maxScale: 1
});

var animationInterval = null;
var functions = {}
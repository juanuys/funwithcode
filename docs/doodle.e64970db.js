parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"SwgO":[function(require,module,exports) {
var t=document.getElementById("canvas");t.height=window.innerHeight,t.width=window.innerWidth;var n=t.getContext("2d"),i=null;function e(){i=!1}function h(){i=!0;var e=20,h=t.height/e,o=e/2,a=(t.width-e)/4;n.lineWidth=10;var d=function(t){var n=t.getBoundingClientRect();return n.bottom>=0&&n.bottom<=(window.innerHeight||document.documentElement.clientHeight)||n.top>=0&&n.top<=(window.innerHeight||document.documentElement.clientHeight)};function r(i,d,r){Math.random();for(var w=0;w<h;w++){var s=w/h,M=Math.sin(s*Math.PI*6)*(31*Math.sin(i*d*2)),c=Math.sin(s*Math.PI*5)*(37*Math.sin(i*d*4)),l=Math.sin(s*Math.PI*4)*(43*Math.sin(i*d*6)),m=Math.sin(s*Math.PI*3)*(77*Math.sin(i*d*8)),u=Math.sin(s*Math.PI*2)*(91*Math.sin(i*d*10)),g=Math.sin(s*Math.PI)*(101*Math.sin(i*d*12));n.strokeStyle="hsla("+r+", 100%, 50%, 0.4)",n.beginPath(),n.moveTo(o,w*e+o),n.lineTo(o+a+m,w*e+o+M),n.lineTo(o+2*a+u,w*e+o+c),n.lineTo(o+3*a+g,w*e+o+l),n.lineTo(t.width-o,w*e+o),n.stroke()}}var w=0,s=0,M=0;window.requestAnimationFrame(function e(){i&&d(t)&&(n.clearRect(0,0,t.width,t.height),r(++w,.001,s),r(2*w,1e-4,M),s+=1,M+=.1,window.requestAnimationFrame(e))})}window.addEventListener("resize",function(){t.width=window.innerWidth,t.height=window.innerHeight,e(),h()}),h();
},{}]},{},["SwgO"], null)
//# sourceMappingURL=/funwithcode/doodle.e64970db.js.map
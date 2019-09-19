/**
 * 1 unit = 1 cm
 */

var THREE = require('three')
import { OrbitControls } from './orbitcontrols';
import BoundingBox from './src/boundingbox'
import BoidManager from './src/boidManager';

var scene, camera, renderer, frustum, controls, fishBowl, light, lure, boidManager, clock;

var staticCone

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
  // camera = new THREE.OrthographicCamera( window.innerWidth / - 4, window.innerWidth / 4, window.innerHeight / 4, window.innerHeight / - 4, 0.1, 1000 );
  camera.position.z  = 500;

  // frustum stuff
  camera.updateMatrix();
  camera.updateMatrixWorld();
  frustum = new THREE.Frustum();
  var projScreenMatrix = new THREE.Matrix4();
  projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // CONTROLS
  controls = new OrbitControls(camera, renderer.domElement);
  //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 100;
  controls.maxDistance = 1000;
  controls.maxPolarAngle = Math.PI / 2;

  // FLOOR
  // var material3 = new THREE.MeshStandardMaterial({color: 0x932a99});
  // var geometry3 = new THREE.PlaneGeometry(400, 400, 100, 100);
  // var mesh3 = new THREE.Mesh(geometry3, material3);
  // mesh3.rotation.x = -90 * (Math.PI / 180);
  // mesh3.position.y = -200;
  // scene.add(mesh3);

  // FISHBOWL
  // fishBowl = new BoundingBox(400, 400, 400, 0xa33aff);
  // scene.add(fishBowl.mesh)

  // LIGHTS

  //ambient light
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  // var lights = [];
  // lights[0] = new THREE.PointLight(0xffffff, 1, 0);
  // lights[1] = new THREE.PointLight(0xffffff, 1, 0);
  // lights[2] = new THREE.PointLight(0xffffff, 1, 0);

  // lights[0].position.set(0, 800, 0);
  // lights[1].position.set(100, 200, 100);
  // lights[2].position.set(- 100, - 200, - 100);

  // scene.add(lights[0]);
  // scene.add(lights[1]);
  // scene.add(lights[2]);

  light = new THREE.PointLight(0xffffff, 0.5, 500);
  light.position.set(0, 100, 0);
  scene.add(light);
  // var lightHelper = new THREE.PointLightHelper(light);
  // scene.add(lightHelper);

  // var light = new THREE.SpotLight( 0xffffff, 3.0, 1000 );
  // light.position.y = 1000 // up in the sky
  // light.target = boundingBox.mesh;
  // scene.add( light );
  // var spotLightHelper = new THREE.SpotLightHelper(light);
  // scene.add(spotLightHelper);

  // TARGET

  lure = null
  // lure = new THREE.PointLight(0xffffff, 3, 500);
  // lure.position.set(0, 50, 0);
  // scene.add(lure);
  // var lightHelper = new THREE.PointLightHelper(lure);
  // scene.add(lightHelper);

  // BOIDS
  boidManager = new BoidManager(200, [fishBowl], lure)
  boidManager.boids.forEach(boid => {
    scene.add(boid.mesh)
  })

  // CLOCK
  clock = new THREE.Clock();

  var axesHelper = new THREE.AxesHelper(50);
  scene.add(axesHelper);


  // TMP (experimentation)

  // var geometry = new THREE.ConeGeometry( 5, 10, 8 );
  // geometry.rotateX(THREE.Math.degToRad(90));
  // var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
  // staticCone = new THREE.Mesh( geometry, material );
  // staticCone.position.copy(new THREE.Vector3(100, 100, 100))
  // scene.add(staticCone);
  // staticCone.lookAt(new THREE.Vector3(0,0,0))

  // var geometry = new THREE.CylinderGeometry( 1, 5, 10, 8 );
  // geometry.rotateX(THREE.Math.degToRad(90));
  // var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
  // staticCone = new THREE.Mesh( geometry, material );
  // staticCone.position.copy(new THREE.Vector3(100, 100, 100))
  // scene.add( staticCone );
  // staticCone.lookAt(new THREE.Vector3(0,0,0))
}

// loop vars
var counter = 0;
var paused = false
var slowPanEnabled = false

function update(delta) {
  counter += 0.001;

  boidManager.update(delta)

  if (slowPanEnabled) {
    camera.lookAt(light.position);
    camera.position.x = Math.sin(counter) * 500;
    camera.position.z = Math.cos(counter) * 500;
  }

  if (lure) {
    lure.position.x = Math.sin(counter * 5) * 400;
    lure.position.y = Math.cos(counter * 10) * 400;
    lure.position.z = Math.cos(counter * 15) * 400;
  }
}

function render() {
  var delta = clock.getDelta();
  if (!paused) {
    update(delta)
  }

  renderer.render(scene, camera);
}

var animate = function () {
  requestAnimationFrame(animate);

  // only required if controls.enableDamping = true, or if controls.autoRotate = true
  controls.update();

  render()
};



window.addEventListener('resize', function () {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 32) {
        paused = !paused;

        // disable slow-pan so when animation is resumed, the viewer has the controls.
        if (slowPanEnabled) {
          slowPanEnabled = false
        }
    }
};


init()

animate();
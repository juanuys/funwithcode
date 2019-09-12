var THREE = require('three')
import { OrbitControls } from './orbitcontrols';

var numberOfBoids = 1;
var boids = []
var scene, camera, renderer, frustum, controls;

function init() {
  scene = new THREE.Scene();
  // camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera = new THREE.OrthographicCamera( window.innerWidth / - 4, window.innerWidth / 4, window.innerHeight / 4, window.innerHeight / - 4, 0.1, 1000 );

  // frustum stuff
  camera.updateMatrix();
  camera.updateMatrixWorld();
  frustum = new THREE.Frustum();
  var projScreenMatrix = new THREE.Matrix4();
  projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
  frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // controls

  controls = new OrbitControls( camera, renderer.domElement );
  //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 100;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI / 2;

  // lights
  var lights = [];
  lights[0] = new THREE.PointLight(0xffffff, 1, 0);
  lights[1] = new THREE.PointLight(0xffffff, 1, 0);
  lights[2] = new THREE.PointLight(0xffffff, 1, 0);

  lights[0].position.set(0, 200, 0);
  lights[1].position.set(100, 200, 100);
  lights[2].position.set(- 100, - 200, - 100);

  scene.add(lights[0]);
  scene.add(lights[1]);
  scene.add(lights[2]);

  camera.position.z = 200;
}

function initBoids() {
  for (let i = 0; i < numberOfBoids; i++) {
    var randomX = Math.random() * 250 - 125
    var randomY = Math.random() * 250 - 125
    var randomAngle = Math.random() * (Math.PI * 2 /* full rotation */)
    var colour = null // will use default color in getBoid

    // reference boid
    if (i === 0) {
      randomX = 0
      randomY = 0
      randomAngle = 0
      colour = 0xe56289
    }

    var position = new THREE.Vector3(randomX, randomY, 0)

    var quaternion = new THREE.Quaternion();

    quaternion.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), randomAngle);

    var boid = getBoid(position, quaternion, colour);
    scene.add(boid);
    boids.push(boid)
  }
}



var opt = 1;

function getBoid(position = new THREE.Vector3( 0, 0, 0 ), quaternion = null, color = 0x156289) {
  if (color === null) {
    color = 0x156289
  }
  var mesh

  var geometry = new THREE.ConeGeometry(5, 10, 8)

  // basic
  // var material = new THREE.MeshBasicMaterial( {color: 0x3592b9} );
  // mesh = new THREE.Mesh( geometry, material );

  // wireframe
  mesh = new THREE.Group();
  var lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
  var meshMaterial = new THREE.MeshPhongMaterial({ color, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true });
  mesh.add(new THREE.LineSegments(new THREE.WireframeGeometry(geometry), lineMaterial));
  mesh.add(new THREE.Mesh(geometry, meshMaterial));

  mesh.position.copy(position)
  if (quaternion) {
    mesh.quaternion.copy(quaternion)
  }

  return mesh
}

function update() {
  boids.forEach(boid => {
    boid.translateY(0.5);
  })

  // boids[0].rotation.z += 0.01;
  // boids[0].rotation.y += 0.01;
}

function render() {
  update()

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


init()
initBoids()
animate();
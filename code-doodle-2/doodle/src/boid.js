var THREE = require('three')

var minSpeed = 2
var maxSpeed = 5
var maxSteerForce = 3

var targetWeight = 1

const clamp = function(it, min, max) {
  return Math.min(Math.max(it, min), max);
};

export default class Boid {
  constructor(target, position, quaternion, colour) {
    this.mesh = this.getBoid(position, quaternion, colour)
    this.target = target

    // re-usable acceleration vector
    this.acceleration = new THREE.Vector3();

    // velocity is speed in a given direction, and in the update method we'll
    // compute an acceleration that will change the velocity
    var startSpeed = (minSpeed + maxSpeed) / 2;
    this.velocity = this.mesh.up.multiplyScalar(startSpeed);
  }

  getBoid(position = new THREE.Vector3(0, 0, 0), quaternion = null, color = 0x156289) {
    if (color === null) {
      color = 0x156289
    }

    var geometry = new THREE.ConeGeometry(5, 10, 8)

    var mesh = new THREE.Group();
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

  /**
   * From the paper:
   * Collision Avoidance: avoid collisions with nearby flockmates (aka separation)
   *
   * We've generalised to avoid collision with other arbritrary obstacles.
   *
   * Simply look at each obstacle, and if it's within a defined small distance (say 100 units),
   * then move it as far away again as it already is. This is done by subtracting from a vector
   * "steerVector" (initialised to zero) the displacement of each obstacle which is near by.
   * The vector "steerVector" is then added to the current position to move the boid away from
   * obstacles near it.
   */
  separate(obstacles) {

    const steerVector = new THREE.Vector3();

    obstacles.map(obstacle => {
      // if (this.mesh.position)
    })
  }

  /**
   * The boid will update its "steer vector" based on:
   * - Collision Avoidance: avoid collisions with nearby flockmates (and other obstacles)
   * - Velocity Matching: attempt to match velocity with nearby flockmates
   * - Flock Centering: attempt to stay close to nearby flockmates
   *
   * Alternative definitions for the above terms are:
   * - separation: steer to avoid crowding local flockmates
   * - alignment: steer towards the average heading of local flockmates
   * - cohesion: steer to move towards the average position (center of mass) of local flockmates
   */
  update(delta, obstacles) {


    // fly towards the target
    if (this.target) {

      // var pos = this.target.position.clone()
      // pos.sub(this.mesh.position);
      // var accelerationTowardsTarget = this.steerTowards(pos).multiplyScalar(targetWeight);

      var accelerationTowardsTarget = this.seek(this.target.position)

      // "flee" would use sub
      this.acceleration.add(accelerationTowardsTarget)
    } else {
      // just fly forward for now
      this.mesh.translateY(minSpeed);

      // TODO "wander" behaviour?
    }

    this.applyAcceleration()
  }

  applyAcceleration() {
    this.acceleration.clampLength(0, maxSteerForce);
    this.velocity.add(this.acceleration);
    this.acceleration.set(0, 0, 0); // reset

    this.velocity.clampLength(0, maxSpeed)
    this.mesh.position.add(this.velocity)

    // change heading
    this.mesh.lookAt(this.velocity)
  }

  seek (target) {
    var steerVector = target.clone().sub(this.mesh.position);
    steerVector.normalize().setLength(maxSpeed).sub(this.velocity);
    return steerVector
  }
}

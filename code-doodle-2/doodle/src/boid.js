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
    var acceleration = THREE.Vector3();

    // fly towards the target
    if (this.target) {
      var offsetToTarget = this.target.position.sub(this.mesh.position);
      acceleration = this.steerTowards(offsetToTarget).multiplyScalar(targetWeight);
    } else {
      // just fly forward for now
      this.mesh.translateY(minSpeed);
    }

    // apply new acceleration
    acceleration.multiplyScalar(delta)
    this.velocity.add(acceleration)
    var speed = this.velocity.length();
    var newVelocity = this.velocity.clone()
    newVelocity.divideScalar(speed);
    speed = clamp(speed, minSpeed, maxSpeed);
    newVelocity.multiplyScalar(speed)
    this.velocity.copy(newVelocity);


    // this.mesh.position += this.velocity * delta
    // this.velocity.multiplyScalar(delta * 20)
    this.mesh.position.add(this.velocity)

    // set boid's "forward" to the new direction
    this.mesh.quaternion.setFromUnitVectors(this.mesh.up, this.velocity.clone().normalize());
  }

  steerTowards(vector) {
    var vec = vector.normalize().multiplyScalar(maxSpeed).sub(this.velocity);
    return vec.clampLength(0, maxSteerForce);
  }
}

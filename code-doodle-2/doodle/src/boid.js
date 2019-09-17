var THREE = require('three')

var minSpeed = 2
var maxSpeed = 5
var maxSteerForce = 3

var maxForceSeek = 0.05
var maxForceSeparation = 10

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

    this.forward = new THREE.Vector3( 0, 0, 1 )
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
      // var accelerationTowardsTarget = this.steerTowards(pos).multiplyScalar(maxForceSeek);

      var accelerationTowardsTarget = this.seek(this.target.position)

      // "flee" would use sub
      this.acceleration.add(accelerationTowardsTarget)
    } else {
      // just fly forward for now
      this.mesh.translateY(minSpeed);

      // TODO "wander" behaviour?
    }

    // steering behaviour: separation
    this.acceleration.add(this.separate(obstacles))

    // steering behaviour: alignment
    this.acceleration.add(this.align(obstacles))

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
    steerVector.clampLength(0, maxForceSeek);
    return steerVector
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
  separate(obstacles, range = 30) {

    const steerVector = new THREE.Vector3();

    var neighbourInRangeCount = 0

    obstacles.forEach((obstacle) => {

      // skip same object
      if (obstacle.mesh.id === this.mesh.id) return;

      const distance = obstacle.mesh.position.distanceTo(this.mesh.position)
      if (distance <= range) {
        steerVector.add(obstacle.mesh.position.clone().sub(this.mesh.position));
          neighbourInRangeCount++;
      }

    })

    if (neighbourInRangeCount != 0) {
      steerVector.divideScalar(neighbourInRangeCount)
      steerVector.negate();
    }
    steerVector.normalize();

    return steerVector;
  }

  /**
   * Produces a steering force that keeps a boid's heading aligned with its neighbours.
   *
   * @param {*} neighbours
   */
  align(neighbours, range = 30) {
    const steerVector = new THREE.Vector3();
    const averageDirection = new THREE.Vector3();

    var neighboursInRangeCount = 0;

    neighbours.forEach(neighbour => {

      // skip same object
      if (neighbour.mesh.id === this.mesh.id) return;

      const distance = neighbour.mesh.position.distanceTo(this.mesh.position)
      if (distance <= range) {
        neighboursInRangeCount++
        var neighbourDirection = neighbour.velocity.clone().normalize()
        averageDirection.add(neighbourDirection);
      }
    })

		if (neighboursInRangeCount > 0) {
			averageDirection.divideScalar(neighboursInRangeCount);
      var myDirection = this.velocity.clone().normalize()
			steerVector.subVectors(averageDirection, myDirection);
    }
    return steerVector;
  }
}

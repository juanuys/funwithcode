import { throws } from 'assert';

var THREE = require('three')

var minSpeed = 2
var maxSpeed = 5
var maxSteerForce = 1

var maxForceSeek = 1
var maxForceSeparation = 10

const clamp = function(it, min, max) {
  return Math.min(Math.max(it, min), max);
};

export default class Boid {
  constructor(target, position, quaternion, colour, followTarget = false) {
    this.mesh = this.getBoid(position, quaternion, colour)
    this.target = target

    // re-usable acceleration vector
    this.acceleration = new THREE.Vector3();

    // velocity is speed in a given direction, and in the update method we'll
    // compute an acceleration that will change the velocity
    var startSpeed = (minSpeed + maxSpeed) / 2;
    this.velocity = this.mesh.up.multiplyScalar(startSpeed);

    this.forward = new THREE.Vector3( 0, 0, 1 )

    // if a boid is the leader, it will follow the target (and set the course, so to speak)
    this.followTarget = followTarget;
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
  update(delta, neighbours, obstacles) {


    // fly towards the target
    if (this.target && this.followTarget) {

      // var pos = this.target.position.clone()
      // pos.sub(this.mesh.position);
      // var accelerationTowardsTarget = this.steerTowards(pos).multiplyScalar(maxForceSeek);

      var accelerationTowardsTarget = this.seek(delta, this.target.position)

      // "flee" would use sub
      this.acceleration.add(accelerationTowardsTarget)
    } else {
      // just fly forward for now
      this.mesh.translateY(minSpeed);

      // TODO "wander" behaviour?
    }

    // steering behaviour: separation
    this.acceleration.add(this.separation(delta, neighbours, obstacles))

    // steering behaviour: alignment
    this.acceleration.add(this.alignment(delta, neighbours))

    // steering behaviour: cohesion
    this.acceleration.add(this.cohesion(delta, neighbours))

    this.applyAcceleration(delta)
  }

  applyAcceleration(delta) {
    this.acceleration.clampLength(0, maxSteerForce);
    this.velocity.add(this.acceleration);
    this.acceleration.set(0, 0, 0); // reset

    this.velocity.clampLength(0, maxSpeed)
    this.mesh.position.add(this.velocity)

    // change heading
    this.mesh.lookAt(this.velocity)
  }

  seek (delta, target) {
    var steerVector = target.clone().sub(this.mesh.position);
    steerVector.normalize().setLength(maxSpeed).sub(this.velocity);
    steerVector.clampLength(0, maxForceSeek);
    steerVector.multiplyScalar(delta)
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
   * "steerVector" (initialised to zero) the displacement of each obstacle which is nearby.
   * The vector "steerVector" is then later added to the current position to move the boid away from
   * obstacles near it.
   */
  separation(delta, neighbours, obstacles, range = 30) {

    const steerVector = new THREE.Vector3();

    var neighbourInRangeCount = 0



    neighbours.concat(obstacles).forEach((obstacle) => {

      // skip same object
      if (obstacle.mesh.id === this.mesh.id) return;

      const distance = obstacle.mesh.position.distanceTo(this.mesh.position)
      if (distance <= range) {
        steerVector.add(obstacle.mesh.position.clone().sub(this.mesh.position));
          neighbourInRangeCount++;
      }

    })

    if (neighbourInRangeCount > 0) {
      steerVector.divideScalar(neighbourInRangeCount)
      steerVector.negate()
    }
    // steerVector.normalize();

    steerVector.multiplyScalar(delta)
    return steerVector;
  }

  /**
   * Produces a steering force that keeps a boid's heading aligned with its neighbours.
   *
   * @param {*} neighbours
   */
  alignment(delta, neighbours, range = 30) {
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

    steerVector.multiplyScalar(delta)
    return steerVector;
  }

  /**
   * Produces a steering force that moves a boid toward the center of mass of its neighbours.
   *
   * @param {*} neighbours
   */
  cohesion(delta, neighbours, range = 30) {
    var steerVector
    const centreOfMass = new THREE.Vector3();

    var neighboursInRangeCount = 0;

    neighbours.forEach(neighbour => {

      // skip same object
      if (neighbour.mesh.id === this.mesh.id) return;

      const distance = neighbour.mesh.position.distanceTo(this.mesh.position)
      if (distance <= range) {
        neighboursInRangeCount++
        centreOfMass.add(neighbour.mesh.position)
      }
    })

    if (neighboursInRangeCount > 0) {
      centreOfMass.divideScalar(neighboursInRangeCount);

      // "seek" the centre of mass
      steerVector = this.seek(delta, centreOfMass)
      steerVector.normalize()
    } else {
      steerVector = new THREE.Vector3()
    }

    steerVector.multiplyScalar(delta)
    return steerVector;
  }
}

import { throws } from 'assert';

var THREE = require('three')

const minSpeed = 1
const maxSpeed = 3
const maxSteerForce = 5

const maxForceSeek = 1
const maxForceSeparation = 10

const wanderDistance = 10;
const wanderRadius = 5;
const wanderRange = 1;

const numSamplesForSmoothing = 20

const wanderWeight = 0.25
const cohesionWeight = 1.2
const separationWeight = 0.1
const alignmentWeight = 1

var counter = 0

const nullSteerVector = new THREE.Vector3()

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
    // this.velocity = this.mesh.up.multiplyScalar(startSpeed);
    this.velocity = new THREE.Vector3(0, 0, 0);

    // this.forward = new THREE.Vector3( 0, 0, 1 )

    // if a boid is the leader, it will follow the target (and set the course, so to speak)
    this.followTarget = followTarget;

    this.wanderAngle = 0

    // remember the last however many velocities so we can smooth the heading of the boid
    this.velocitySamples = []

    this.wanderTarget = nullSteerVector
  }

  getBoid(position = new THREE.Vector3(0, 0, 0), quaternion = null, color = 0x156289) {
    if (color === null) {
      color = 0x156289
    }

    var geometry = new THREE.ConeGeometry(5, 10, 8)
    // rotate the geometry, because the face used by lookAt is not the cone's "tip"
    geometry.rotateX(THREE.Math.degToRad(90));

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

    counter++

    // if (counter < 250) {
    //   this.acceleration.add(this.seek(delta, new THREE.Vector3(0, 100, 200)))
    // } else {
    //   this.acceleration.add(this.seek(delta, new THREE.Vector3(-100, 0, 100)))
    // }

    // var target = new THREE.Vector3(0, 100, 200)
    // var distance = this.mesh.position.distanceTo(target)
    // if (distance > 5) {
    //   this.acceleration.add(this.seek(delta, target))
    // } else {
    //   console.log(this.velocity, this.velocity.length())
    // }


    // this.acceleration.add(this.seek(delta, target))
    // this.acceleration.add(nullSteerVector)
    // console.log(this.mesh.position)



    // this.applyAcceleration(delta)
    // this.lookWhereGoing()


    // this.mesh.lookAt(this.velocity)


    // const head = this.velocity.clone();
    // head.add(this.mesh.position);
    // this.mesh.lookAt(head);


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
      // this.mesh.translateY(minSpeed);

      this.acceleration.add(this.wander(delta).multiplyScalar(wanderWeight))
    }

    // steering behaviour: alignment
    this.acceleration.add(this.alignment(delta, neighbours).multiplyScalar(alignmentWeight))

    // steering behaviour: cohesion
    this.acceleration.add(this.cohesion(delta, neighbours).multiplyScalar(cohesionWeight))

    // steering behaviour: separation
    this.acceleration.add(this.separation(delta, neighbours, obstacles).multiplyScalar(separationWeight))

    this.applyAcceleration(delta)

    this.lookWhereGoing()
  }

  applyAcceleration(delta) {
    // if (this.velocity.length() < 1) {
    //   this.velocity = new THREE.Vector3()
    // }
    // console.log(this.acceleration)
    // console.log("this.acceleration.length() >", this.acceleration.length())
    this.acceleration.clampLength(0, maxSteerForce);
    // console.log("this.acceleration.length() <", this.acceleration.length())
    // this.velocity.add(this.acceleration.multiplyScalar(delta));
    this.velocity.add(this.acceleration);
    this.acceleration.set(0, 0, 0); // reset

    // console.log("this.velocity.length() >", this.velocity.length())

    // console.log(this.velocity.length())
    this.velocity.clampLength(minSpeed, maxSpeed)

    // console.log("this.velocity.length() <", this.velocity.length())
    this.mesh.position.add(this.velocity)
    // console.log(this.velocity)
  }

  /**
   * Once the boid reaches a stationary target, and the target doesn't change, it will flip/flop on the spot.
   * That's because the old velocity is retained.
   * @param {*} delta
   * @param {*} target
   */
  seek (delta, target) {
    var steerVector = nullSteerVector
    // // if distance between boid and target is small, do nothing
    // var distance = this.mesh.position.distanceTo(target)
    // if (distance < 5) {
    //   // do nothing, but remember that the old velocity is maintained.
    // } else {
    //   // console.log(distance)
    //   steerVector = target.clone().sub(this.mesh.position);
    //   steerVector.normalize().sub(this.velocity);
    //   steerVector.multiplyScalar(delta)
    // }

    steerVector = target.clone().sub(this.mesh.position);
    steerVector.normalize().sub(this.velocity);
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

    neighbours.concat(obstacles).forEach(obstacle => {

      if (obstacle === null || typeof obstacle === 'undefined') return

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

    // don't normalise, as the boid really doesn't want to crash into a neighbour,
    // so a larger magnitude must have an effect
    // steerVector.normalize();

    // can't find a nice way to integrate delta
    steerVector.multiplyScalar(delta)
    return steerVector;
  }

  /**
   * Produces a steering force that keeps a boid's heading aligned with its neighbours.
   *
   * @param {*} neighbours
   */
  alignment(delta, neighbours, range = 50) {
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

  rndCoord(range = 195) {
    return (Math.random() - 0.5) * range * 2
  }
  wander(delta) {

    var distance = this.mesh.position.distanceTo(this.wanderTarget)
    if (distance < 5) {
      // when we reach the target, set a new random target
      this.wanderTarget = new THREE.Vector3(this.rndCoord(), this.rndCoord(), this.rndCoord())
      counter = 0
    } else if (counter > 500) {
      this.wanderTarget = new THREE.Vector3(this.rndCoord(), this.rndCoord(), this.rndCoord())
      counter = 0
    }

    return this.seek(delta, this.wanderTarget)
  }

  wander2(delta) {
    var steerVector = this.velocity.clone().normalize().setLength(wanderDistance);
    var offset = new THREE.Vector3(1, 1, 1);
    offset.setLength(wanderRadius);
    offset.x = Math.sin(this.wanderAngle) * offset.length()
    offset.z = Math.cos(this.wanderAngle) * offset.length()
    offset.y = Math.sin(this.wanderAngle) * offset.length()

    this.wanderAngle += Math.random() * wanderRange - wanderRange * .5;
    steerVector.add(offset)
    return steerVector
  }

  lookWhereGoing(smoothing = true) {
    // var direction = this.mesh.position.clone().add(this.velocity.clone())
    var direction = this.velocity.clone()
    if (smoothing) {
        if (this.velocitySamples.length == numSamplesForSmoothing) {
            this.velocitySamples.shift();
        }

        this.velocitySamples.push(this.velocity.clone());
        direction.set(0, 0, 0);
        this.velocitySamples.forEach(sample => {
          direction.add(sample)
        })
        direction.divideScalar(this.velocitySamples.length)
        // direction = this.mesh.position.clone().add(direction)
    }

    direction.add(this.mesh.position);
    this.mesh.lookAt(direction)
  }
}

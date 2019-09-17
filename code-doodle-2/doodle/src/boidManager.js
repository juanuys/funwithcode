var THREE = require('three')
import Boid from './boid';

export default class BoidManager {
  /**
   *
   * @param {*} numberOfBoids
   * @param {*} obstacles other obstacles in the world to consider when avoiding collisions
   * @param {*} target a target for all boids to move towards
   */
  constructor(numberOfBoids = 20, obstacles = [], target = null) {

    // create the boids
    this.initBoids(numberOfBoids, target)

    // for each boid, add the other boids to its collidableMeshList, and also add
    // the meshes from the common collidableMeshList

    this.obstacles = obstacles
  }

  initBoids(numberOfBoids, target) {
    this.boids = this.boids || [];

    var randomX, randomY, randomZ, randomAngle, colour, followTarget

    for (let i = 0; i < numberOfBoids; i++) {
      randomX = Math.random() * 250 - 125
      randomY = Math.random() * 250 - 125
      randomZ = Math.random() * 250 - 125
      randomAngle = Math.random() * (Math.PI * 2 /* full rotation */)
      colour = null // will use default color in getBoid
      followTarget = true

      // reference boid
      if (i === 0) {
        randomX = 0
        randomY = 0
        randomAngle = 0
        colour = 0xe56289
        // followTarget = true
      }

      var position = new THREE.Vector3(randomX, randomY, randomZ)

      var quaternion = new THREE.Quaternion();

      quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), randomAngle);

      var boid = new Boid(target, position, quaternion, colour, followTarget);
      this.boids.push(boid)
    }
  }

  update(delta) {
    this.boids.forEach(boid => {
      boid.update(delta, this.boids, this.obstacles)
    })
  }
}
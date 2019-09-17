var THREE = require('three')
import Boid from './boid';

export default class BoidManager {
  /**
   *
   * @param {*} numberOfBoids
   * @param {*} collidableMeshList
   * @param {*} target all boids move towards the target
   */
  constructor(numberOfBoids = 20, collidableMeshList = [], target = null) {

    // create the boids
    this.initBoids(numberOfBoids, target)

    // for each boid, add the other boids to its collidableMeshList, and also add
    // the meshes from the common collidableMeshList


  }

  initBoids(numberOfBoids, target) {
    this.boids = this.boids || [];
    for (let i = 0; i < numberOfBoids; i++) {
      var randomX = Math.random() * 250 - 125
      var randomY = Math.random() * 250 - 125
      var randomZ = Math.random() * 250 - 125
      var randomAngle = Math.random() * (Math.PI * 2 /* full rotation */)
      var colour = null // will use default color in getBoid

      // reference boid
      if (i === 0) {
        randomX = 0
        randomY = 0
        randomAngle = 0
        colour = 0xe56289
      }

      var position = new THREE.Vector3(randomX, randomY, randomZ)

      var quaternion = new THREE.Quaternion();

      quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), randomAngle);

      var boid = new Boid(target, position, quaternion, colour);
      this.boids.push(boid)
    }
  }

  update(delta) {
    this.boids.forEach(boid => {
      boid.update(delta, this.boids)
    })
  }
}
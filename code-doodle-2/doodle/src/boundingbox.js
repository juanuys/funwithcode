var THREE = require('three')

export default class BoundingBox {
  constructor(width = 100, height = 100, depth = 100, color = 0xffffff) {
      const geometry = new THREE.BoxGeometry(width, height, depth, 10, 10, 10);

      this.mesh = new THREE.Group();
      var lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.05 });
      const meshMaterial = new THREE.MeshLambertMaterial({
          color,
          transparent: true,
          opacity: 0.2,
          wireframe: false,
          depthWrite: false,
          blending: THREE.AdditiveBlending
      });
      this.mesh.add(new THREE.LineSegments(new THREE.WireframeGeometry(geometry), lineMaterial));
      this.mesh.add(new THREE.Mesh(geometry, meshMaterial));
  }
}
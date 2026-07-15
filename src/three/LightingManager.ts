import * as THREE from 'three';

export class LightingManager {
  public group: THREE.Group;

  constructor() {
    this.group = new THREE.Group();

    // 1. Hemisphere light for ambient depth
    const hemiLight = new THREE.HemisphereLight('#f5f5f7', '#0a0a0c', 0.8);
    this.group.add(hemiLight);

    // 2. Directional light simulating distant starlight
    const dirLight = new THREE.DirectionalLight('#ffffff', 1.2);
    dirLight.position.set(10, 20, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.group.add(dirLight);

    // 3. Cinematic Rim Light (Warm Amber/Violet tint)
    const rimLight = new THREE.DirectionalLight('#e0b57e', 2.0);
    rimLight.position.set(-15, -10, -20);
    this.group.add(rimLight);
  }
}

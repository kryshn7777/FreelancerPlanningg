import * as THREE from 'three';

export class SceneManager {
  public scene: THREE.Scene;

  constructor() {
    this.scene = new THREE.Scene();
    
    // Set a cinematic, near-black background
    this.scene.background = new THREE.Color('#030304');
    
    // Add subtle fog for depth scaling
    this.scene.fog = new THREE.FogExp2('#030304', 0.02);
  }

  public dispose() {
    // Traverse scene and correctly dispose of geometries and materials
    this.scene.traverse((object: any) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((mat: any) => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    this.scene.clear();
  }
}

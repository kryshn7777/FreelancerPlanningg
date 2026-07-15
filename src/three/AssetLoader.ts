import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export class AssetLoader {
  private gltfLoader: GLTFLoader;
  
  constructor() {
    this.gltfLoader = new GLTFLoader();
    
    // Configure DRACO compression for optimized geometry loading
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.gltfLoader.setDRACOLoader(dracoLoader);
  }

  public async loadGLTF(url: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          resolve(gltf.scene);
        },
        undefined,
        (error) => {
          console.error(`[AssetLoader] Error loading ${url}`, error);
          reject(error);
        }
      );
    });
  }
}

import * as THREE from 'three';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  
  // Parallax tracking
  private mouseX = 0;
  private mouseY = 0;
  private targetX = 0;
  private targetY = 0;
  private windowHalfX = window.innerWidth / 2;
  private windowHalfY = window.innerHeight / 2;
  private zOffset = 0;

  constructor(width: number, height: number) {
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 20);
    
    // Listen for mouse movement for parallax
    document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);
  }

  private onDocumentMouseMove(event: MouseEvent) {
    this.mouseX = (event.clientX - this.windowHalfX) * 0.001;
    this.mouseY = (event.clientY - this.windowHalfY) * 0.001;
  }

  public setZOffset(offset: number) {
    this.zOffset = offset;
  }

  public update(deltaTime: number) {
    // Smooth dampening for parallax (inertia)
    this.targetX = this.mouseX * 0.5;
    this.targetY = this.mouseY * 0.5;

    // Apply parallax rotation offset
    this.camera.rotation.y += (this.targetX - this.camera.rotation.y) * 0.05;
    this.camera.rotation.x += (this.targetY - this.camera.rotation.x) * 0.05;

    // Apply hyperloop z-offset directly to position
    // Base Z is 20, we add the offset to push through the scene
    this.camera.position.z = 20 + this.zOffset;
  }

  public resize(width: number, height: number) {
    this.windowHalfX = width / 2;
    this.windowHalfY = height / 2;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}

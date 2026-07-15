import * as THREE from 'three';

export class OrbitalModules {
  public group: THREE.Group;
  public modules: { id: string, mesh: THREE.Mesh | THREE.Object3D, speed: number, radius: number, angle: number }[] = [];

  constructor() {
    this.group = new THREE.Group();
    
    // Material for the Orbital Rings (Very faint, thin line)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x384159, transparent: true, opacity: 0.1 });
    
    // Material for the Modules (Highly polished dark reflective spheres like black pearls)
    const moduleMat = new THREE.MeshPhysicalMaterial({
      color: 0x050505,
      metalness: 1.0,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 2.0
    });

    const orbits = [
      { id: 'module-01', radius: 10, speed: 0.15, tiltX: 0.1, tiltZ: 0.2, size: 0.6 },
      { id: 'module-02', radius: 14, speed: 0.1, tiltX: -0.15, tiltZ: 0.1, size: 0.4 },
      { id: 'module-03', radius: 18, speed: 0.08, tiltX: 0.05, tiltZ: -0.2, size: 0.8 }
    ];

    orbits.forEach((orbit, index) => {
      // 1. Create Orbital Ring Line
      const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(orbit.radius, 0.01, 16, 256), ringMat);
      ringMesh.rotation.x = Math.PI / 2 + orbit.tiltX;
      ringMesh.rotation.z = orbit.tiltZ;
      this.group.add(ringMesh);

      // 2. Create Polished Module Sphere
      const modObj = new THREE.Mesh(new THREE.SphereGeometry(orbit.size, 64, 64), moduleMat);

      // Add to a pivot
      const pivot = new THREE.Group();
      pivot.rotation.x = orbit.tiltX;
      pivot.rotation.z = orbit.tiltZ;
      pivot.add(modObj);
      
      this.group.add(pivot);

      this.modules.push({
        id: orbit.id,
        mesh: modObj,
        speed: orbit.speed,
        radius: orbit.radius,
        angle: Math.random() * Math.PI * 2
      });
    });
  }

  public update(deltaTime: number, elapsedTime: number) {
    this.modules.forEach(mod => {
      mod.angle += mod.speed * deltaTime;
      
      mod.mesh.position.x = Math.cos(mod.angle) * mod.radius;
      mod.mesh.position.z = Math.sin(mod.angle) * mod.radius;
    });
  }
}


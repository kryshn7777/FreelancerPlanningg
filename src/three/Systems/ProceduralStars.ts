import * as THREE from 'three';

export class ProceduralStars {
  public mesh: THREE.InstancedMesh;
  public material: THREE.ShaderMaterial;
  private particleCount: number = 30000;
  private dummy: THREE.Object3D;

  constructor() {
    this.dummy = new THREE.Object3D();

    const geometry = new THREE.IcosahedronGeometry(0.02, 0);
    
    // We are going to calculate everything in the vertex shader for maximum GPU efficiency
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uWarpSpeed: { value: 0 } // GSAP will control this
      },
      vertexShader: `
        uniform float uTime;
        uniform float uWarpSpeed;
        varying float vAlpha;
        
        // Random 3D vector generator for initial positions
        float random(vec3 scale, float seed) {
          return fract(sin(dot(gl_InstanceMatrix[3].xyz + seed, scale)) * 43758.5453 + seed);
        }

        void main() {
          vec3 pos = (instanceMatrix * vec4(position, 1.0)).xyz;
          
          // Orbital rotation around the center
          float angle = uTime * 0.05 + random(pos, 1.0) * 6.28;
          float radius = length(pos.xz);
          
          vec3 orbitPos = pos;
          orbitPos.x = cos(angle) * radius;
          orbitPos.z = sin(angle) * radius;
          
          // Hyperloop Warp Effect (Stretching Z axis based on uWarpSpeed)
          orbitPos.z += mod(uTime * uWarpSpeed * 50.0 + random(pos, 2.0) * 100.0, 200.0) - 100.0;
          
          // Warp Stretching
          vec3 scale = vec3(1.0, 1.0, 1.0 + uWarpSpeed * 10.0);
          vec3 stretchedPos = orbitPos * scale;

          vec4 mvPosition = modelViewMatrix * vec4(stretchedPos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Twinkle effect
          vAlpha = (sin(uTime * 2.0 + random(pos, 3.0) * 10.0) * 0.5 + 0.5) * (1.0 - clamp(uWarpSpeed * 0.1, 0.0, 0.8));
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;
          
          // Pure white stars for contrast
          gl_FragColor = vec4(1.0, 1.0, 1.0, vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.mesh = new THREE.InstancedMesh(geometry, this.material, this.particleCount);

    // Scatter the stars globally
    for (let i = 0; i < this.particleCount; i++) {
      const x = (Math.random() - 0.5) * 300;
      const y = (Math.random() - 0.5) * 300;
      const z = (Math.random() - 0.5) * 300;
      this.dummy.position.set(x, y, z);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }
    
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  public update(deltaTime: number, elapsedTime: number) {
    this.material.uniforms.uTime.value = elapsedTime;
  }
}

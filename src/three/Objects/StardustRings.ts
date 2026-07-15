import * as THREE from 'three';

export class StardustRings {
  public group: THREE.Group;
  private materials: THREE.ShaderMaterial[] = [];
  
  constructor() {
    this.group = new THREE.Group();
    
    // Create 3 distinct twisting ring systems
    this.createRingSystem(70000, 4.0, 15.0, 0.4, '#e0b57e', 0.02);
    this.createRingSystem(50000, 6.0, 25.0, 0.8, '#ffffff', 0.015);
    this.createRingSystem(30000, 8.0, 35.0, 1.5, '#384159', 0.01);
  }

  private createRingSystem(particleCount: number, innerRadius: number, outerRadius: number, verticalSpread: number, colorHex: string, speed: number) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const randoms = new Float32Array(particleCount * 3); // For shader variation
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Use exponential distribution for density towards the inner radius
      const r = innerRadius + Math.pow(Math.random(), 2.5) * (outerRadius - innerRadius);
      const theta = Math.random() * Math.PI * 2;
      
      // Calculate sweeping galactic arms by twisting the angle based on radius
      const twist = (r - innerRadius) * 0.5;
      const finalTheta = theta + twist;

      // Vertical spread tighter at the center, looser at edges
      const y = (Math.random() - 0.5) * verticalSpread * (r / innerRadius);

      positions[i * 3 + 0] = Math.cos(finalTheta) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(finalTheta) * r;

      randoms[i * 3 + 0] = Math.random();
      randoms[i * 3 + 1] = Math.random();
      randoms[i * 3 + 2] = Math.random();
      
      // Variable star sizes, occasional large ones
      sizes[i] = Math.random() > 0.98 ? Math.random() * 2.5 : Math.random() * 0.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(colorHex) },
        uSpeed: { value: speed },
        uHyperloop: { value: 0 }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uSpeed;
        uniform float uHyperloop;
        attribute vec3 aRandom;
        attribute float aSize;
        varying float vAlpha;

        void main() {
          vec3 pos = position;
          
          // Orbital rotation
          float angle = uTime * uSpeed + aRandom.x * 6.28;
          float radius = length(pos.xz);
          
          // Add a subtle sine wave drift to the Y axis
          pos.y += sin(uTime * 0.5 + aRandom.y * 10.0) * 0.5;

          // Add chaotic z-movement based on hyperloop speed (stars streaking past)
          pos.z += sin(uTime * 5.0 + aRandom.x * 100.0) * uHyperloop * 20.0;

          // Rotate around center
          pos.x = cos(angle) * radius;
          pos.z = sin(angle) * radius;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          
          // Size attenuation based on distance - reduced base size to 15.0
          gl_PointSize = aSize * (15.0 / -mvPosition.z) * (1.0 + uHyperloop * 2.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Twinkle effect - alpha reduced to 0.15
          vAlpha = 0.05 + (sin(uTime * 2.0 + aRandom.z * 20.0) * 0.5 + 0.5) * 0.10;
          vAlpha += uHyperloop * 0.3; // Make them brighter during hyperloop
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;

        void main() {
          // Circular particle
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;
          
          // Soft edge
          float strength = 1.0 - (dist * 2.0);
          strength = pow(strength, 2.0); // Make it a tighter point
          
          gl_FragColor = vec4(uColor, strength * vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    
    // Tilt the entire ring system slightly for cinematic angles
    particles.rotation.x = (Math.random() - 0.5) * 0.4;
    particles.rotation.z = (Math.random() - 0.5) * 0.4;
    
    this.group.add(particles);
    this.materials.push(material);
  }

  public update(deltaTime: number, elapsedTime: number) {
    this.materials.forEach(material => {
      material.uniforms.uTime.value = elapsedTime;
    });
    
    // Slowly rotate the entire group for majestic parallax
    this.group.rotation.y = elapsedTime * -0.01;
  }

  public setHyperloopSpeed(speed: number) {
    this.materials.forEach(material => {
      if (material.uniforms.uHyperloop) {
        material.uniforms.uHyperloop.value = speed;
      }
    });
  }
}

import * as THREE from 'three';

export class CosmicDust {
  public mesh: THREE.Points;
  private material: THREE.ShaderMaterial;

  constructor() {
    const particleCount = 12000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const randomOffsets = new Float32Array(particleCount);

    const radius = 250; // Large volume

    for (let i = 0; i < particleCount; i++) {
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random()) * radius;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Warm and cool dust colors
      const isWarm = Math.random() > 0.5;
      const color = new THREE.Color(isWarm ? '#e0b57e' : '#6c8ebf');
      
      // Add some subtle variance
      color.lerp(new THREE.Color('#ffffff'), Math.random() * 0.2);

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Small sizes for dust
      sizes[i] = Math.random() * 2.0 + 0.5;
      
      // Random offset for drifting
      randomOffsets[i] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aRandomOffset', new THREE.BufferAttribute(randomOffsets, 1));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uColorOpacity: { value: 0.3 }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPixelRatio;
        attribute float size;
        attribute float aRandomOffset;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = color;
          
          // Gentle drifting motion based on random offset and time
          vec3 pos = position;
          pos.x += sin(uTime * 0.1 + aRandomOffset) * 5.0;
          pos.y += cos(uTime * 0.15 + aRandomOffset) * 5.0;
          pos.z += sin(uTime * 0.05 + aRandomOffset) * 5.0;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Size attenuation
          gl_PointSize = size * uPixelRatio * (200.0 / -mvPosition.z);
          
          // Twinkle effect
          vAlpha = (sin(uTime * 0.5 + aRandomOffset * 10.0) * 0.5 + 0.5) * 0.8 + 0.2;
        }
      `,
      fragmentShader: `
        uniform float uColorOpacity;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          // Circular particle
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          // Soft edge
          float alpha = (1.0 - (dist * 2.0)) * vAlpha * uColorOpacity;
          
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.mesh = new THREE.Points(geometry, this.material);
  }

  update(dt: number, elapsedTime: number) {
    this.material.uniforms.uTime.value = elapsedTime;
  }
}

import * as THREE from 'three';

export class AICore {
  public group: THREE.Group;
  public material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;

  constructor() {
    this.group = new THREE.Group();
    
    // We use a slightly oversized sphere to give volume for the accretion disk shader
    const geometry = new THREE.SphereGeometry(4.0, 128, 128);
    
    // Advanced Volumetric Black Hole Shader
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorPrimary: { value: new THREE.Color('#030304') }, // Absolute Black
        uColorDisk: { value: new THREE.Color('#e0b57e') }, // Warm Amber/Gold accretion
        uColorWeb: { value: new THREE.Color('#8a9cb8') }, // Neural blue/violet webbing
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;

        // 3D Simplex Noise for Neural Webbing Displacement
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        float snoise(vec3 v){ 
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 = v - i + dot(i, C.xxx) ;
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );
          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
          i = mod(i, 289.0 ); 
          vec4 p = permute( permute( permute( 
                     i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
          float n_ = 1.0/7.0; 
          vec3  ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          
          // Micro-displacements to create physical ridges for the neural web
          float noise = snoise(vec3(position.x * 2.0 + uTime * 0.1, position.y * 2.0, position.z * 2.0 - uTime * 0.1));
          float highFreq = snoise(vec3(position.x * 10.0, position.y * 10.0, position.z * 10.0 + uTime));
          
          vec3 newPosition = position + normal * (noise * 0.05 + highFreq * 0.01);
          
          vec4 worldPos = modelMatrix * vec4(newPosition, 1.0);
          vWorldPosition = worldPos.xyz;
          
          vec4 mvPosition = viewMatrix * worldPos;
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorPrimary;
        uniform vec3 uColorDisk;
        uniform vec3 uColorWeb;
        uniform float uTime;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;

        // FBM for Accretion Disk Gas
        float random(vec3 p) {
            return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        }
        float noise(vec3 p) {
            vec3 i = floor(p);
            vec3 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(mix(random(i + vec3(0,0,0)), random(i + vec3(1,0,0)), f.x),
                    mix(random(i + vec3(0,1,0)), random(i + vec3(1,1,0)), f.x), f.y),
                mix(mix(random(i + vec3(0,0,1)), random(i + vec3(1,0,1)), f.x),
                    mix(random(i + vec3(0,1,1)), random(i + vec3(1,1,1)), f.x), f.y), f.z);
        }
        float fbm(vec3 p) {
            float f = 0.0;
            float amp = 0.5;
            for(int i=0; i<5; i++) {
                f += amp * noise(p);
                p *= 2.01;
                amp *= 0.5;
            }
            return f;
        }

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          
          float NdotV = dot(normal, viewDir);
          
          // --- 1. Event Horizon (The Void) ---
          // NdotV is 1.0 at the direct center facing the camera.
          // We carve out a perfectly black circle for the shadow.
          float voidBlend = smoothstep(0.75, 0.85, NdotV); 
          float matterMask = 1.0 - voidBlend;
          
          // --- 2. Relativistic Plasma Spin ---
          // Calculate an equatorial angle to stretch the noise
          float angle = atan(vWorldPosition.z, vWorldPosition.x);
          float yDist = abs(vWorldPosition.y);
          
          // Fast moving, horizontally stretched noise
          vec3 noisePos = vec3(angle * 10.0 - uTime * 4.0, vWorldPosition.y * 12.0, 0.0);
          float plasmaNoise = fbm(noisePos);
          plasmaNoise = smoothstep(0.3, 0.7, plasmaNoise);
          
          // Focus the plasma at the equator
          float equator = smoothstep(0.6, 0.0, yDist);
          
          // Fresnel creates the glowing edge
          float fresnel = 1.0 - max(NdotV, 0.0);
          
          // The intense, thin photon ring just outside the shadow
          float photonRing = smoothstep(0.65, 0.8, fresnel) * smoothstep(0.95, 0.8, fresnel);
          
          // --- 3. Compute Intensity ---
          float intensity = (plasmaNoise * equator * fresnel) * 1.5;
          intensity += photonRing * 3.0;
          intensity *= matterMask; // Mask out the black hole center
          
          // --- 4. Color Mapping ---
          vec3 darkRed = vec3(0.6, 0.1, 0.0);
          vec3 hotOrange = uColorDisk; // #e0b57e
          vec3 coreWhite = vec3(1.0, 0.95, 0.9);
          
          vec3 color = mix(darkRed, hotOrange, smoothstep(0.1, 0.5, intensity));
          color = mix(color, coreWhite, smoothstep(0.8, 1.5, intensity));
          
          vec3 finalColor = color * intensity;
          
          // Edge fade to transparent so it blends cleanly with the background
          float alphaMask = smoothstep(0.0, 0.2, NdotV);

          gl_FragColor = vec4(finalColor, alphaMask);
          
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      transparent: true, // Allow blending if needed, but primarily opaque
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.group.add(this.mesh);
  }

  public update(deltaTime: number, elapsedTime: number) {
    this.material.uniforms.uTime.value = elapsedTime;
    this.group.rotation.y = elapsedTime * 0.1;
    this.group.rotation.z = Math.sin(elapsedTime * 0.05) * 0.1;
  }
}

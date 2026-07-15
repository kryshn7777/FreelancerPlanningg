import * as THREE from 'three';
import { EffectComposer, RenderPass, EffectPass, BloomEffect, VignetteEffect, NoiseEffect } from 'postprocessing';

export class Renderer {
  public instance: THREE.WebGLRenderer;
  public composer: EffectComposer;

  constructor(canvas: HTMLCanvasElement, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.instance = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: false, // Turn off for postprocessing, usually handle AA via passes or rely on high-DPI
      alpha: false,
      powerPreference: 'high-performance'
    });

    // Configure cinematic rendering
    this.instance.outputColorSpace = THREE.SRGBColorSpace;
    this.instance.toneMapping = THREE.ACESFilmicToneMapping;
    this.instance.toneMappingExposure = 1.2;
    
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.instance.setSize(window.innerWidth, window.innerHeight);

    // Setup Effect Composer
    this.composer = new EffectComposer(this.instance, {
      multisampling: Math.min(window.devicePixelRatio, 2) === 1 ? 4 : 0 // MS on low-dpi only
    });

    const renderPass = new RenderPass(scene, camera);
    
    // 1. Bloom for optical glow
    const bloomEffect = new BloomEffect({
      intensity: 1.0,
      mipmapBlur: true,
      luminanceThreshold: 0.2,
      luminanceSmoothing: 0.8,
      resolutionScale: 0.5 // Optimize performance
    });

    // 2. Vignette for cinematic focus
    const vignetteEffect = new VignetteEffect({
      eskil: false,
      offset: 0.3,
      darkness: 0.5
    });

    const effectPass = new EffectPass(camera, bloomEffect, vignetteEffect);
    
    this.composer.addPass(renderPass);
    this.composer.addPass(effectPass);
  }

  public resize(width: number, height: number) {
    this.instance.setSize(width, height);
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.composer.setSize(width, height);
  }

  public render() {
    this.composer.render();
  }
}

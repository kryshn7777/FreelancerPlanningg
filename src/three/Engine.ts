import * as THREE from 'three';
import { SceneManager } from './SceneManager';
import { CameraController } from './CameraController';
import { Renderer } from './Renderer';
import { AssetLoader } from './AssetLoader';
import { LightingManager } from './LightingManager';
import { AnimationSystem } from './Systems/AnimationSystem';
import { AICore } from './Objects/AICore';
import { OrbitalModules } from './Objects/OrbitalModules';
import { StardustRings } from './Objects/StardustRings';
import { ProceduralStars } from './Systems/ProceduralStars';
import { CosmicDust } from './Objects/CosmicDust';
import { Nebula } from './Objects/Nebula';

export class Engine {
  public sceneManager: SceneManager;
  public cameraController: CameraController;
  public renderer: Renderer;
  public assetLoader: AssetLoader;
  public lightingManager: LightingManager;
  public animationSystem: AnimationSystem;
  
  public aiCore: AICore;
  public orbitalModules: OrbitalModules;
  public stardustRings: StardustRings;
  public stars: ProceduralStars;
  public cosmicDust: CosmicDust;
  public nebula: Nebula;
  
  private clock: THREE.Clock;
  private isRunning: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    // 1. Initialize Core Systems
    this.sceneManager = new SceneManager();
    this.cameraController = new CameraController(window.innerWidth, window.innerHeight);
    this.renderer = new Renderer(canvas, this.sceneManager.scene, this.cameraController.camera);
    this.assetLoader = new AssetLoader();
    this.lightingManager = new LightingManager();
    this.animationSystem = new AnimationSystem();
    this.clock = new THREE.Clock();

    // 2. Initialize Objects
    this.aiCore = new AICore();
    this.orbitalModules = new OrbitalModules();
    this.stardustRings = new StardustRings();
    this.stars = new ProceduralStars();
    this.cosmicDust = new CosmicDust();
    this.nebula = new Nebula();

    // 3. Compose Scene
    this.sceneManager.scene.add(this.cameraController.camera);
    this.sceneManager.scene.add(this.lightingManager.group);
    this.sceneManager.scene.add(this.aiCore.group);
    this.sceneManager.scene.add(this.orbitalModules.group);
    this.sceneManager.scene.add(this.stardustRings.group);
    this.sceneManager.scene.add(this.stars.mesh);
    this.sceneManager.scene.add(this.cosmicDust.mesh);
    this.sceneManager.scene.add(this.nebula.mesh);

    // Register Updatables
    this.animationSystem.register(this.aiCore);
    this.animationSystem.register(this.orbitalModules);
    this.animationSystem.register(this.stardustRings);
    this.animationSystem.register(this.stars);
    this.animationSystem.register(this.cosmicDust);
    this.animationSystem.register(this.nebula);

    // 4. Handle Resize
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // 4. Start Engine
    this.start();
  }

  private start() {
    this.isRunning = true;
    this.renderer.instance.setAnimationLoop(this.update.bind(this));
  }

  private update() {
    if (!this.isRunning) return;

    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Update sub-systems
    this.cameraController.update(deltaTime);
    this.animationSystem.update(deltaTime, elapsedTime);

    // Render Frame via PostProcessing Composer
    this.renderer.render();
  }

  private onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.cameraController.resize(width, height);
    this.renderer.resize(width, height);
  }

  public dispose() {
    this.isRunning = false;
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    
    this.renderer.instance.dispose();
    this.sceneManager.dispose();
  }
}

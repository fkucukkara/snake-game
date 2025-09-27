import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Color,
  Vector3,
  PCFSoftShadowMap,
  Fog,
  HemisphereLight,
  PointLight
} from 'three';

/**
 * Manages Three.js rendering and scene setup
 */
export class Renderer {
  private renderer: WebGLRenderer;
  private scene: Scene;
  private camera: PerspectiveCamera;
  private lights: (AmbientLight | DirectionalLight | HemisphereLight | PointLight)[] = [];

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: true 
    });
    this.scene = new Scene();
    this.camera = new PerspectiveCamera();
    
    this.initialize();
  }

  /**
   * Initialize renderer settings
   */
  private initialize(): void {
    // Renderer setup
    this.renderer.setSize(800, 600);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(new Color(0x87CEEB), 1); // Sky blue background
    
    // Enhanced shadow settings
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    
    // Enable tone mapping for better colors
    this.renderer.toneMapping = 1; // ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2;
    
    // Enable physically correct lights
    this.renderer.useLegacyLights = false;

    // Camera setup
    this.camera.fov = 75;
    this.camera.aspect = 800 / 600;
    this.camera.near = 0.1;
    this.camera.far = 1000;
    this.camera.position.set(0, 20, 20);
    this.camera.lookAt(0, 0, 0);

    // Add atmospheric fog with natural sky color
    this.scene.fog = new Fog(0x87CEEB, 30, 120);

    // Setup enhanced lighting
    this.setupLighting();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  /**
   * Setup natural outdoor lighting
   */
  private setupLighting(): void {
    // Hemisphere light for natural sky/ground lighting
    const hemisphereLight = new HemisphereLight(0x87CEEB, 0x2d5a2d, 0.4);
    this.scene.add(hemisphereLight);
    this.lights.push(hemisphereLight);

    // Main directional light (sun)
    const mainLight = new DirectionalLight(0xFFFFDD, 2.0);
    mainLight.position.set(15, 25, 10);
    mainLight.castShadow = true;
    
    // Enhanced shadow settings
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 100;
    mainLight.shadow.camera.left = -25;
    mainLight.shadow.camera.right = 25;
    mainLight.shadow.camera.top = 25;
    mainLight.shadow.camera.bottom = -25;
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;
    mainLight.shadow.radius = 8;
    mainLight.shadow.blurSamples = 25;

    this.scene.add(mainLight);
    this.lights.push(mainLight);

    // Fill light for softer shadows (warm afternoon light)
    const fillLight = new DirectionalLight(0xFFE4B5, 0.4);
    fillLight.position.set(-8, 15, -8);
    this.scene.add(fillLight);
    this.lights.push(fillLight);

    // Ambient light for overall natural illumination
    const ambientLight = new AmbientLight(0xFFFFE0, 0.3);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);
  }

  /**
   * Handle window resize
   */
  private onWindowResize(): void {
    const container = this.canvas.parentElement;
    if (!container) return;

    const width = Math.min(800, container.clientWidth - 40);
    const height = Math.min(600, container.clientHeight - 40);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Render the scene
   */
  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Update camera position (for following snake)
   */
  updateCamera(targetPosition: Vector3): void {
    const offset = new Vector3(0, 20, 20);
    const newPosition = targetPosition.clone().add(offset);
    
    // Smooth camera following with easing
    this.camera.position.lerp(newPosition, 0.05);
    
    // Look at target with slight offset for better view
    const lookAtTarget = targetPosition.clone();
    lookAtTarget.y += 1;
    this.camera.lookAt(lookAtTarget);
  }

  /**
   * Get the scene for adding/removing objects
   */
  getScene(): Scene {
    return this.scene;
  }

  /**
   * Get the camera
   */
  getCamera(): PerspectiveCamera {
    return this.camera;
  }

  /**
   * Get the renderer
   */
  getRenderer(): WebGLRenderer {
    return this.renderer;
  }

  /**
   * Resize the renderer
   */
  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.lights.forEach(light => {
      this.scene.remove(light);
      if ('dispose' in light) {
        (light as any).dispose();
      }
    });
    
    this.renderer.dispose();
    window.removeEventListener('resize', () => this.onWindowResize());
  }
}
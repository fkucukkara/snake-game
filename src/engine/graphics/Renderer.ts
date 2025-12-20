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
  PointLight,
  SRGBColorSpace
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
   * Initialize renderer settings with modern features
   */
  private initialize(): void {
    // Renderer setup with advanced features - full screen
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(new Color(0x87CEEB), 1); // Sky blue background
    
    // Enhanced shadow settings for realistic shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = true;
    
    // Enable advanced tone mapping for HDR-like colors
    this.renderer.toneMapping = 1; // ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.4; // Increased for brighter, more vibrant colors
    
    // Enable physically correct lights for realistic rendering
    this.renderer.useLegacyLights = false;
    
    // Enable high-quality output encoding
    this.renderer.outputColorSpace = SRGBColorSpace;

    // Camera setup - adjusted for larger arena
    this.camera.fov = 75;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.near = 0.1;
    this.camera.far = 1000;
    this.camera.position.set(0, 35, 35); // Higher and further back for better view
    this.camera.lookAt(0, 0, 0);

    // Add atmospheric fog with natural sky color - extended range
    this.scene.fog = new Fog(0x87CEEB, 50, 150);

    // Setup enhanced lighting
    this.setupLighting();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  /**
   * Setup modern outdoor lighting with realistic effects
   */
  private setupLighting(): void {
    // Hemisphere light for natural sky/ground lighting (increased intensity)
    const hemisphereLight = new HemisphereLight(0x87CEEB, 0x2d5a2d, 0.6);
    hemisphereLight.position.set(0, 50, 0);
    this.scene.add(hemisphereLight);
    this.lights.push(hemisphereLight);

    // Main directional light (sun) with enhanced settings
    const mainLight = new DirectionalLight(0xFFFFEE, 2.5); // Increased intensity and warmer
    mainLight.position.set(15, 30, 10);
    mainLight.castShadow = true;
    
    // Ultra high-quality shadow settings
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 120;
    mainLight.shadow.camera.left = -30;
    mainLight.shadow.camera.right = 30;
    mainLight.shadow.camera.top = 30;
    mainLight.shadow.camera.bottom = -30;
    mainLight.shadow.mapSize.width = 4096; // Keep high resolution
    mainLight.shadow.mapSize.height = 4096;
    mainLight.shadow.radius = 10; // Softer shadows
    mainLight.shadow.blurSamples = 30; // More blur samples

    this.scene.add(mainLight);
    this.lights.push(mainLight);

    // Fill light for softer shadows (warm afternoon light) - enhanced
    const fillLight = new DirectionalLight(0xFFE4B5, 0.6); // Increased intensity
    fillLight.position.set(-10, 20, -10);
    fillLight.castShadow = false; // Don't cast shadows to improve performance
    this.scene.add(fillLight);
    this.lights.push(fillLight);
    
    // Additional rim light for better depth perception
    const rimLight = new DirectionalLight(0xCCE0FF, 0.5);
    rimLight.position.set(5, 10, -15);
    rimLight.castShadow = false;
    this.scene.add(rimLight);
    this.lights.push(rimLight);

    // Ambient light for overall natural illumination - warmer tone
    const ambientLight = new AmbientLight(0xFFFFE5, 0.4); // Increased intensity
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);
  }

  /**
   * Handle window resize for full-screen
   */
  private onWindowResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

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
    const offset = new Vector3(0, 35, 35); // Increased for larger arena
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
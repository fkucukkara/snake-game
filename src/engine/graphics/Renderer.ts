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
    this.renderer.setClearColor(new Color(0x0a0e1a), 1); // Deep dark blue-purple background
    
    // Optimized shadow settings
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = true;
    this.renderer.shadowMap.needsUpdate = false; // Let Three.js manage updates
    
    // Enable advanced tone mapping for HDR-like colors
    this.renderer.toneMapping = 1; // ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.4; // Increased for vibrant modern look
    
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

    // Add atmospheric fog matching modern dark background - extended range
    this.scene.fog = new Fog(0x0a0e1a, 50, 150);

    // Setup enhanced lighting
    this.setupLighting();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  /**
   * Setup modern neon/cyber lighting with vibrant effects
   */
  private setupLighting(): void {
    // Hemisphere light with modern cyan/purple tones
    const hemisphereLight = new HemisphereLight(0x1a1f2e, 0x0a0e1a, 0.8);
    hemisphereLight.position.set(0, 50, 0);
    this.scene.add(hemisphereLight);
    this.lights.push(hemisphereLight);

    // Main directional light with cool blue-white tone
    const mainLight = new DirectionalLight(0x88ccff, 3.0); // Bright cyan-white
    mainLight.position.set(15, 30, 10);
    mainLight.castShadow = true;
    
    // Optimized shadow settings for better performance
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 120;
    mainLight.shadow.camera.left = -30;
    mainLight.shadow.camera.right = 30;
    mainLight.shadow.camera.top = 30;
    mainLight.shadow.camera.bottom = -30;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.radius = 6;
    mainLight.shadow.blurSamples = 15;

    this.scene.add(mainLight);
    this.lights.push(mainLight);

    // Accent light with purple/magenta tone
    const accentLight = new DirectionalLight(0xff66cc, 1.2);
    accentLight.position.set(-10, 20, -10);
    accentLight.castShadow = false;
    this.scene.add(accentLight);
    this.lights.push(accentLight);
    
    // Neon rim light for cyber aesthetic
    const rimLight = new DirectionalLight(0x00ffff, 1.0);
    rimLight.position.set(5, 10, -15);
    rimLight.castShadow = false;
    this.scene.add(rimLight);
    this.lights.push(rimLight);

    // Ambient light with modern cool tone
    const ambientLight = new AmbientLight(0x334455, 0.6);
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
    
    // Smooth camera following with consistent interpolation
    this.camera.position.lerp(newPosition, 0.1);
    
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
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Color,
  Vector3
} from 'three';

/**
 * Manages Three.js rendering and scene setup
 */
export class Renderer {
  private renderer: WebGLRenderer;
  private scene: Scene;
  private camera: PerspectiveCamera;
  private lights: (AmbientLight | DirectionalLight)[] = [];

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
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(new Color(0x1a1a2e), 1);
    this.renderer.shadowMap.enabled = true;

    // Camera setup
    this.camera.fov = 75;
    this.camera.aspect = 800 / 600;
    this.camera.near = 0.1;
    this.camera.far = 1000;
    this.camera.position.set(0, 15, 15);
    this.camera.lookAt(0, 0, 0);

    // Setup lighting
    this.setupLighting();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  /**
   * Setup scene lighting
   */
  private setupLighting(): void {
    // Ambient light for general illumination
    const ambientLight = new AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);

    // Directional light for shadows and depth
    const directionalLight = new DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    
    // Shadow camera settings
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;

    this.scene.add(directionalLight);
    this.lights.push(directionalLight);
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
    const offset = new Vector3(0, 15, 15);
    const newPosition = targetPosition.clone().add(offset);
    
    this.camera.position.lerp(newPosition, 0.1);
    this.camera.lookAt(targetPosition);
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
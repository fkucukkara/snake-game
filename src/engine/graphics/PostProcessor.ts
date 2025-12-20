import { 
  WebGLRenderer, 
  Scene, 
  Camera, 
  WebGLRenderTarget,
  ShaderMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Mesh,
  Vector2,
  LinearFilter,
  RGBAFormat,
  HalfFloatType
} from 'three';

/**
 * Simple bloom/glow post-processing effect
 */
export class PostProcessor {
  private renderer: WebGLRenderer;
  private bloomTarget!: WebGLRenderTarget;
  private finalTarget!: WebGLRenderTarget;
  private bloomMaterial!: ShaderMaterial;
  private composeMaterial!: ShaderMaterial;
  private quad!: Mesh;
  private camera!: OrthographicCamera;
  private resolution: Vector2;

  constructor(renderer: WebGLRenderer) {
    this.renderer = renderer;
    this.resolution = new Vector2(renderer.domElement.width, renderer.domElement.height);

    this.setupRenderTargets();
    this.setupMaterials();
    this.setupQuad();
  }

  private setupRenderTargets(): void {
    this.bloomTarget = new WebGLRenderTarget(
      this.resolution.x * 0.5, 
      this.resolution.y * 0.5,
      {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        format: RGBAFormat,
        type: HalfFloatType
      }
    );

    this.finalTarget = new WebGLRenderTarget(
      this.resolution.x, 
      this.resolution.y,
      {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        format: RGBAFormat
      }
    );
  }

  private setupMaterials(): void {
    // Enhanced bloom extraction shader
    this.bloomMaterial = new ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        threshold: { value: 0.6 }, // Lower threshold for more bloom
        intensity: { value: 1.5 } // Higher intensity
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float threshold;
        uniform float intensity;
        varying vec2 vUv;
        
        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));
          
          if (brightness > threshold) {
            gl_FragColor = vec4(color.rgb * intensity, color.a);
          } else {
            gl_FragColor = vec4(0.0, 0.0, 0.0, color.a);
          }
        }
      `
    });

    // Enhanced compose shader with vignette and color grading
    this.composeMaterial = new ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        tBloom: { value: null },
        bloomStrength: { value: 0.5 } // Increased bloom strength
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D tBloom;
        uniform float bloomStrength;
        varying vec2 vUv;
        
        // Vignette function
        float vignette(vec2 uv, float intensity, float extent) {
          uv = uv * 2.0 - 1.0;
          float vignette = 1.0 - dot(uv, uv) * intensity;
          return pow(vignette, extent);
        }
        
        // Color grading - warm tone
        vec3 colorGrade(vec3 color) {
          // Slight warm color shift
          color.r *= 1.05;
          color.g *= 1.02;
          color.b *= 0.98;
          
          // Increase saturation slightly
          float gray = dot(color, vec3(0.299, 0.587, 0.114));
          color = mix(vec3(gray), color, 1.15);
          
          return color;
        }
        
        void main() {
          vec4 original = texture2D(tDiffuse, vUv);
          vec4 bloom = texture2D(tBloom, vUv);
          
          // Combine with bloom
          vec3 color = original.rgb + bloom.rgb * bloomStrength;
          
          // Apply color grading
          color = colorGrade(color);
          
          // Apply vignette
          float vig = vignette(vUv, 0.3, 1.5);
          color *= vig;
          
          // Add subtle film grain
          float grain = (fract(sin(dot(vUv, vec2(12.9898, 78.233)) * 43758.5453)) - 0.5) * 0.015;
          color += grain;
          
          gl_FragColor = vec4(color, original.a);
        }
      `
    });
  }

  private setupQuad(): void {
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new PlaneGeometry(2, 2);
    this.quad = new Mesh(geometry, this.bloomMaterial);
  }

  /**
   * Process the scene with bloom effect
   */
  render(scene: Scene, camera: Camera, renderTarget?: WebGLRenderTarget | null): void {
    // Render original scene to main target
    this.renderer.setRenderTarget(this.finalTarget);
    this.renderer.render(scene, camera);

    // Extract bright areas for bloom
    this.bloomMaterial.uniforms.tDiffuse.value = this.finalTarget.texture;
    this.quad.material = this.bloomMaterial;
    
    this.renderer.setRenderTarget(this.bloomTarget);
    this.renderer.render(this.quad, this.camera);

    // Compose original + bloom
    this.composeMaterial.uniforms.tDiffuse.value = this.finalTarget.texture;
    this.composeMaterial.uniforms.tBloom.value = this.bloomTarget.texture;
    this.quad.material = this.composeMaterial;

    this.renderer.setRenderTarget(renderTarget || null);
    this.renderer.render(this.quad, this.camera);
  }

  /**
   * Update resolution when renderer size changes
   */
  setSize(width: number, height: number): void {
    this.resolution.set(width, height);
    
    this.bloomTarget.setSize(width * 0.5, height * 0.5);
    this.finalTarget.setSize(width, height);
  }

  /**
   * Set bloom parameters
   */
  setBloomParams(threshold: number, intensity: number, strength: number): void {
    this.bloomMaterial.uniforms.threshold.value = threshold;
    this.bloomMaterial.uniforms.intensity.value = intensity;
    this.composeMaterial.uniforms.bloomStrength.value = strength;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.bloomTarget.dispose();
    this.finalTarget.dispose();
    this.bloomMaterial.dispose();
    this.composeMaterial.dispose();
    this.quad.geometry.dispose();
  }
}
import {
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  Points,
  Scene,
  Color,
  Vector3,
  AdditiveBlending,
  TextureLoader,
  Texture
} from 'three';

/**
 * Particle system for various game effects
 */
export class ParticleSystem {
  private particles!: Points;
  private particleCount: number;
  private positions: Float32Array;
  private velocities: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;
  private lifetimes: Float32Array;
  private maxLifetime: number;
  private scene: Scene;

  constructor(scene: Scene, particleCount: number = 1000) {
    this.scene = scene;
    this.particleCount = particleCount;
    this.maxLifetime = 2.0; // seconds

    this.positions = new Float32Array(particleCount * 3);
    this.velocities = new Float32Array(particleCount * 3);
    this.colors = new Float32Array(particleCount * 3);
    this.sizes = new Float32Array(particleCount);
    this.lifetimes = new Float32Array(particleCount);

    this.initialize();
  }

  private initialize(): void {
    const geometry = new BufferGeometry();

    // Initialize all particles as inactive (lifetime = 0)
    for (let i = 0; i < this.particleCount; i++) {
      this.lifetimes[i] = 0;
      this.sizes[i] = 0;
    }

    geometry.setAttribute('position', new BufferAttribute(this.positions, 3));
    geometry.setAttribute('color', new BufferAttribute(this.colors, 3));
    geometry.setAttribute('size', new BufferAttribute(this.sizes, 1));

    // Create particle material with glow effect
    const material = new PointsMaterial({
      size: 0.5,
      sizeAttenuation: true,
      alphaTest: 0.01,
      transparent: true,
      blending: AdditiveBlending,
      vertexColors: true,
      map: this.createParticleTexture()
    });

    this.particles = new Points(geometry, material);
    this.scene.add(this.particles);
  }

  private createParticleTexture(): Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    
    const context = canvas.getContext('2d')!;
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    
    const texture = new TextureLoader().load(canvas.toDataURL());
    return texture;
  }

  /**
   * Emit particles from a position
   */
  emit(position: Vector3, color: Color, count: number = 20, spread: number = 2): void {
    let emitted = 0;
    
    for (let i = 0; i < this.particleCount && emitted < count; i++) {
      if (this.lifetimes[i] <= 0) {
        const i3 = i * 3;
        
        // Position
        this.positions[i3] = position.x + (Math.random() - 0.5) * spread;
        this.positions[i3 + 1] = position.y + (Math.random() - 0.5) * spread;
        this.positions[i3 + 2] = position.z + (Math.random() - 0.5) * spread;
        
        // Velocity
        this.velocities[i3] = (Math.random() - 0.5) * 10;
        this.velocities[i3 + 1] = Math.random() * 8 + 2;
        this.velocities[i3 + 2] = (Math.random() - 0.5) * 10;
        
        // Color
        this.colors[i3] = color.r;
        this.colors[i3 + 1] = color.g;
        this.colors[i3 + 2] = color.b;
        
        // Size and lifetime
        this.sizes[i] = Math.random() * 0.5 + 0.2;
        this.lifetimes[i] = this.maxLifetime;
        
        emitted++;
      }
    }
  }

  /**
   * Update particle system
   */
  update(deltaTime: number): void {
    let needsUpdate = false;
    
    for (let i = 0; i < this.particleCount; i++) {
      if (this.lifetimes[i] > 0) {
        const i3 = i * 3;
        
        // Update lifetime
        this.lifetimes[i] -= deltaTime;
        
        if (this.lifetimes[i] > 0) {
          // Update position
          this.positions[i3] += this.velocities[i3] * deltaTime;
          this.positions[i3 + 1] += this.velocities[i3 + 1] * deltaTime;
          this.positions[i3 + 2] += this.velocities[i3 + 2] * deltaTime;
          
          // Apply gravity
          this.velocities[i3 + 1] -= 9.8 * deltaTime;
          
          // Fade out over time
          const lifeRatio = this.lifetimes[i] / this.maxLifetime;
          this.sizes[i] = (0.5 + Math.random() * 0.3) * lifeRatio;
          
          needsUpdate = true;
        } else {
          // Particle died
          this.sizes[i] = 0;
        }
      }
    }
    
    if (needsUpdate) {
      this.particles.geometry.getAttribute('position').needsUpdate = true;
      this.particles.geometry.getAttribute('color').needsUpdate = true;
      this.particles.geometry.getAttribute('size').needsUpdate = true;
    }
  }

  /**
   * Create food collection effect
   */
  createFoodCollectionEffect(position: Vector3): void {
    this.emit(position, new Color(0xffff00), 30, 1.5);
  }

  /**
   * Create snake trail effect
   */
  createTrailEffect(position: Vector3): void {
    this.emit(position, new Color(0x00ff44), 5, 0.5);
  }

  /**
   * Create collision effect
   */
  createCollisionEffect(position: Vector3): void {
    this.emit(position, new Color(0xff4444), 50, 3);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.scene.remove(this.particles);
    this.particles.geometry.dispose();
    if (this.particles.material instanceof PointsMaterial) {
      this.particles.material.dispose();
    }
  }
}
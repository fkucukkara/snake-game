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

    // Create enhanced particle material with better glow effect
    const material = new PointsMaterial({
      size: 0.8, // Larger particles for better visibility
      sizeAttenuation: true,
      alphaTest: 0.005, // Lower threshold for softer edges
      transparent: true,
      blending: AdditiveBlending,
      vertexColors: true,
      depthWrite: false, // Disable depth writing for better blending
      map: this.createParticleTexture()
    });

    this.particles = new Points(geometry, material);
    this.scene.add(this.particles);
  }

  private createParticleTexture(): Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 128; // Higher resolution
    canvas.height = 128;
    
    const context = canvas.getContext('2d')!;
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.15, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.6)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(0.85, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    
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
        
        // Velocity - more dynamic spread
        this.velocities[i3] = (Math.random() - 0.5) * 12; // Increased spread
        this.velocities[i3 + 1] = Math.random() * 10 + 3; // Higher initial velocity
        this.velocities[i3 + 2] = (Math.random() - 0.5) * 12;
        
        // Color
        this.colors[i3] = color.r;
        this.colors[i3 + 1] = color.g;
        this.colors[i3 + 2] = color.b;
        
        // Size and lifetime - larger initial size
        this.sizes[i] = Math.random() * 0.8 + 0.4; // Larger particles
        this.lifetimes[i] = this.maxLifetime;
        
        emitted++;
      }
    }
  }

  /**
   * Update particle system (optimized)
   */
  update(deltaTime: number): void {
    let needsUpdate = false;
    let activeParticles = 0;
    
    // Batch update for better performance
    for (let i = 0; i < this.particleCount; i++) {
      if (this.lifetimes[i] > 0) {
        activeParticles++;
        const i3 = i * 3;
        
        // Update lifetime
        this.lifetimes[i] -= deltaTime;
        
        if (this.lifetimes[i] > 0) {
          // Update position
          this.positions[i3] += this.velocities[i3] * deltaTime;
          this.positions[i3 + 1] += this.velocities[i3 + 1] * deltaTime;
          this.positions[i3 + 2] += this.velocities[i3 + 2] * deltaTime;
          
          // Apply gravity with air resistance
          this.velocities[i3 + 1] -= 12.0 * deltaTime;
          this.velocities[i3] *= 0.98;
          this.velocities[i3 + 2] *= 0.98;
          
          // Fade out over time with better curve
          const lifeRatio = this.lifetimes[i] / this.maxLifetime;
          const sizeCurve = Math.pow(lifeRatio, 0.7);
          this.sizes[i] = (0.8 + Math.random() * 0.4) * sizeCurve;
          
          needsUpdate = true;
        } else {
          // Particle died
          this.sizes[i] = 0;
        }
      }
    }
    
    // Only update geometry if there are active particles
    if (needsUpdate && activeParticles > 0) {
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
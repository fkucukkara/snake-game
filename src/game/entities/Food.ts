import {
  MeshStandardMaterial,
  Mesh,
  Vector3,
  Scene,
  Color,
  MathUtils,
  PointLight,
  SphereGeometry,
  CanvasTexture,
  Group
} from 'three';
import { EventManager } from '@/engine/core/EventManager';
import { GameConfig } from '@/types';

/**
 * Enhanced food entity with realistic apple-like appearance
 */
export class Food extends EventManager {
  private foodGroup: Group;
  private mesh!: Mesh;
  private scene: Scene;
  private position: Vector3;
  private value: number = 10;
  private animationSpeed: number = 1.5;
  private animationTime: number = 0;
  private glowLight!: PointLight;

  constructor(scene: Scene, config: GameConfig) {
    super();
    this.scene = scene;
    this.position = new Vector3();
    this.foodGroup = new Group();
    
    this.createRealisticApple(config);
    
    // Create enhanced glowing light for the energy orb
    this.glowLight = new PointLight(0xff00ff, 4.0, 20, 2); // Bright magenta, increased intensity and range
    this.glowLight.castShadow = false; // Disable shadows for performance
    this.glowLight.shadow.mapSize.width = 512;
    this.glowLight.shadow.mapSize.height = 512;
    
    this.scene.add(this.foodGroup);
    this.scene.add(this.glowLight);
    
    this.spawn();
  }

  /**
   * Create glowing energy orb texture
   */
  private createAppleTexture(): CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    
    const context = canvas.getContext('2d')!;
    
    // Transparent background for glow effect
    context.clearRect(0, 0, 256, 256);
    
    // Create energy orb with magenta-pink gradient
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, '#ff66ff');
    gradient.addColorStop(0.3, '#ff00ff');
    gradient.addColorStop(0.6, '#cc00cc');
    gradient.addColorStop(0.9, '#990099');
    gradient.addColorStop(1, 'rgba(153, 0, 153, 0)');
    
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(128, 128, 128, 0, Math.PI * 2);
    context.fill();
    
    // Add bright core
    const coreGradient = context.createRadialGradient(128, 128, 0, 128, 128, 40);
    coreGradient.addColorStop(0, '#ffffff');
    coreGradient.addColorStop(0.5, '#ff99ff');
    coreGradient.addColorStop(1, 'rgba(255, 102, 255, 0)');
    
    context.fillStyle = coreGradient;
    context.beginPath();
    context.arc(128, 128, 40, 0, Math.PI * 2);
    context.fill();
    
    // Add energy waves/rings
    for (let i = 1; i <= 3; i++) {
      const radius = 60 + i * 20;
      context.strokeStyle = `rgba(255, 0, 255, ${0.6 - i * 0.15})`;
      context.lineWidth = 3;
      context.beginPath();
      context.arc(128, 128, radius, 0, Math.PI * 2);
      context.stroke();
    }
    
    // Add sparkles
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const distance = 70 + Math.random() * 30;
      const x = 128 + Math.cos(angle) * distance;
      const y = 128 + Math.sin(angle) * distance;
      const size = Math.random() * 4 + 2;
      
      context.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`;
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    }
    
    return new CanvasTexture(canvas);
  }

  /**
   * Create a modern glowing energy orb
   */
  private createRealisticApple(config: GameConfig): void {
    // Main apple body
    const appleGeometry = new SphereGeometry(config.foodSize / 2, 16, 12);
    // Slightly flatten the apple
    appleGeometry.scale(1, 0.9, 1);
    
    const appleTexture = this.createAppleTexture();
    const appleMaterial = new MeshStandardMaterial({
      map: appleTexture,
      transparent: true,
      opacity: 0.95,
      roughness: 0.1, // Very smooth, glossy surface
      metalness: 0.3, // Slight metalness
      emissive: new Color(0xff00ff), // Bright magenta glow
      emissiveIntensity: 1.0, // Very strong glow for energy orb effect
      envMapIntensity: 1.5 // Strong environment reflections
    });
    
    this.mesh = new Mesh(appleGeometry, appleMaterial);
    this.mesh.castShadow = false; // No shadow for glowing orb
    this.mesh.receiveShadow = false;
    
    // Energy orb is just the main mesh
    // Add mesh to the group
    this.foodGroup.add(this.mesh);
  }

  /**
   * Spawn food at a random position
   */
  spawn(occupiedPositions: Vector3[] = []): void {
    const boundary = 18; // Keep food within arena bounds (slightly inside walls)
    let attempts = 0;
    let validPosition = false;
    
    while (!validPosition && attempts < 100) {
      const x = MathUtils.randFloatSpread(boundary * 2);
      const z = MathUtils.randFloatSpread(boundary * 2);
      
      // Snap to grid
      const gridX = Math.round(x / 2) * 2;
      const gridZ = Math.round(z / 2) * 2;
      
      const newPosition = new Vector3(gridX, 1, gridZ);
      
      // Check if position is occupied by snake
      validPosition = !occupiedPositions.some(pos => 
        pos.distanceTo(newPosition) < 2
      );
      
      if (validPosition) {
        this.position.copy(newPosition);
        this.foodGroup.position.copy(newPosition);
        this.glowLight.position.copy(newPosition);
        this.glowLight.position.y += 1.5;
      }
      
      attempts++;
    }
    
    // If we couldn't find a valid position, just place it randomly
    if (!validPosition) {
      this.position.set(
        MathUtils.randFloatSpread(10),
        1,
        MathUtils.randFloatSpread(10)
      );
      this.foodGroup.position.copy(this.position);
      this.glowLight.position.copy(this.position);
      this.glowLight.position.y += 1.5;
    }
  }

  /**
   * Update food animation with enhanced effects
   */
  update(deltaTime: number): void {
    this.animationTime += deltaTime * this.animationSpeed;
    
    // Enhanced floating animation
    const floatOffset = Math.sin(this.animationTime * 2) * 0.3;
    const bobbing = Math.sin(this.animationTime * 3) * 0.1;
    
    this.foodGroup.position.y = 1 + floatOffset + bobbing;
    
    // Smooth rotation for the energy orb
    this.mesh.rotation.y += deltaTime * 1.2;
    this.mesh.rotation.x += deltaTime * 0.5;
    
    // Update glow light position and create pulsing effect
    this.glowLight.position.copy(this.foodGroup.position);
    this.glowLight.position.y += 1;
    this.glowLight.intensity = 3.0 + Math.sin(this.animationTime * 4) * 0.8; // Stronger pulse
    
    // Color variation in the light - magenta to cyan
    const colorShift = Math.sin(this.animationTime * 3) * 0.15;
    this.glowLight.color.setHSL(0.83 + colorShift, 1, 0.6); // Magenta-pink variation
  }

  /**
   * Collect the food
   */
  collect(): number {
    this.emit('food_collected', this.value);
    return this.value;
  }

  /**
   * Get food position
   */
  getPosition(): Vector3 {
    return this.position.clone();
  }

  /**
   * Check if position is occupied by this food
   */
  isAt(position: Vector3): boolean {
    return this.position.distanceTo(position) < 1;
  }

  /**
   * Reset food position
   */
  reset(occupiedPositions: Vector3[] = []): void {
    this.spawn(occupiedPositions);
    this.animationTime = 0;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    // Dispose of all meshes in the group
    this.foodGroup.children.forEach(child => {
      if (child instanceof Mesh) {
        child.geometry.dispose();
        if (child.material instanceof MeshStandardMaterial) {
          child.material.dispose();
          if (child.material.map) {
            child.material.map.dispose();
          }
        }
      }
    });
    
    this.scene.remove(this.foodGroup);
    
    // Clean up glow light
    if (this.glowLight) {
      this.scene.remove(this.glowLight);
    }
    
    this.clear();
  }
}
import {
  MeshStandardMaterial,
  Mesh,
  Vector3,
  Scene,
  Color,
  MathUtils,
  PointLight,
  IcosahedronGeometry
} from 'three';
import { EventManager } from '@/engine/core/EventManager';
import { GameConfig } from '@/types';

/**
 * Food entity that handles food spawning and collection
 */
export class Food extends EventManager {
  private mesh: Mesh;
  private scene: Scene;
  private position: Vector3;
  private value: number = 10;
  private animationSpeed: number = 2;
  private animationTime: number = 0;
  private glowLight!: PointLight;

  constructor(scene: Scene, config: GameConfig) {
    super();
    this.scene = scene;
    this.position = new Vector3();
    
    // Create more interesting geometry
    const geometry = new IcosahedronGeometry(config.foodSize / 2, 2);
    const material = new MeshStandardMaterial({
      color: new Color(0xff6644),
      emissive: new Color(0x441111),
      emissiveIntensity: 0.3,
      roughness: 0.2,
      metalness: 0.1
    });
    
    this.mesh = new Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    // Create glowing light
    this.glowLight = new PointLight(0xff4444, 1, 8, 2);
    this.glowLight.castShadow = false; // Disable shadows for performance
    
    this.scene.add(this.mesh);
    this.scene.add(this.glowLight);
    
    this.spawn();
  }

  /**
   * Spawn food at a random position
   */
  spawn(occupiedPositions: Vector3[] = []): void {
    const boundary = 8; // Keep food within arena bounds
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
        this.mesh.position.copy(newPosition);
        this.glowLight.position.copy(newPosition);
        this.glowLight.position.y += 1;
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
      this.mesh.position.copy(this.position);
      this.glowLight.position.copy(this.position);
      this.glowLight.position.y += 1;
    }
  }

  /**
   * Update food animation
   */
  update(deltaTime: number): void {
    this.animationTime += deltaTime * this.animationSpeed;
    
    // Enhanced floating animation with pulsing effect
    const floatOffset = Math.sin(this.animationTime) * 0.4;
    const pulseScale = 1 + Math.sin(this.animationTime * 3) * 0.1;
    
    this.mesh.position.y = 1 + floatOffset;
    this.mesh.scale.setScalar(pulseScale);
    
    // Complex rotation animation
    this.mesh.rotation.x += deltaTime * 1;
    this.mesh.rotation.y += deltaTime * 2;
    this.mesh.rotation.z += deltaTime * 0.5;
    
    // Update glow light position and intensity
    this.glowLight.position.copy(this.mesh.position);
    this.glowLight.position.y += 1;
    this.glowLight.intensity = 1 + Math.sin(this.animationTime * 4) * 0.3;
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
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    if (this.mesh.material instanceof MeshStandardMaterial) {
      this.mesh.material.dispose();
    }
    
    // Clean up glow light
    if (this.glowLight) {
      this.scene.remove(this.glowLight);
    }
    
    this.clear();
  }
}
import {
  SphereGeometry,
  MeshPhongMaterial,
  Mesh,
  Vector3,
  Scene,
  Color,
  MathUtils
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

  constructor(scene: Scene, config: GameConfig) {
    super();
    this.scene = scene;
    this.position = new Vector3();
    
    const geometry = new SphereGeometry(config.foodSize / 2, 12, 8);
    const material = new MeshPhongMaterial({
      color: new Color(0xff4444),
      emissive: new Color(0x441111)
    });
    
    this.mesh = new Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    this.scene.add(this.mesh);
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
    }
  }

  /**
   * Update food animation
   */
  update(deltaTime: number): void {
    this.animationTime += deltaTime * this.animationSpeed;
    
    // Floating animation
    const floatOffset = Math.sin(this.animationTime) * 0.3;
    this.mesh.position.y = 1 + floatOffset;
    
    // Rotation animation
    this.mesh.rotation.y += deltaTime * 2;
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
    if (this.mesh.material instanceof MeshPhongMaterial) {
      this.mesh.material.dispose();
    }
    this.clear();
  }
}
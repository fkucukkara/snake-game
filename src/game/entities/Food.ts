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
  Group,
  CylinderGeometry
} from 'three';
import { EventManager } from '@/engine/core/EventManager';
import { GameConfig } from '@/types';

/**
 * Enhanced food entity with realistic apple-like appearance
 */
export class Food extends EventManager {
  private foodGroup: Group;
  private mesh!: Mesh;
  private stemMesh!: Mesh;
  private leafMesh!: Mesh;
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
    
    // Create glowing light for the apple
    this.glowLight = new PointLight(0xff6644, 1.5, 12, 2);
    this.glowLight.castShadow = false; // Disable shadows for performance
    
    this.scene.add(this.foodGroup);
    this.scene.add(this.glowLight);
    
    this.spawn();
  }

  /**
   * Create realistic apple texture
   */
  private createAppleTexture(): CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    
    const context = canvas.getContext('2d')!;
    
    // Create apple base color with gradient
    const gradient = context.createRadialGradient(128, 100, 0, 128, 128, 128);
    gradient.addColorStop(0, '#ff4444');
    gradient.addColorStop(0.6, '#cc2222');
    gradient.addColorStop(1, '#991111');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    
    // Add apple highlights and variations
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const size = Math.random() * 15 + 5;
      const alpha = Math.random() * 0.3 + 0.1;
      
      context.fillStyle = `rgba(255, 100, 100, ${alpha})`;
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    }
    
    // Add some darker spots for realism
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const size = Math.random() * 8 + 2;
      
      context.fillStyle = `rgba(150, 20, 20, ${Math.random() * 0.4})`;
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    }
    
    // Add subtle vertical lines for apple texture
    for (let i = 0; i < 10; i++) {
      const x = (i / 10) * 256 + Math.random() * 20 - 10;
      context.strokeStyle = `rgba(200, 50, 50, 0.3)`;
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x + Math.random() * 30 - 15, 256);
      context.stroke();
    }
    
    return new CanvasTexture(canvas);
  }

  /**
   * Create stem texture
   */
  private createStemTexture(): CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    
    const context = canvas.getContext('2d')!;
    
    // Brown stem color
    const gradient = context.createLinearGradient(0, 0, 0, 64);
    gradient.addColorStop(0, '#8b4513');
    gradient.addColorStop(0.5, '#654321');
    gradient.addColorStop(1, '#3d2914');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    
    // Add wood grain lines
    for (let y = 0; y < 64; y += 4) {
      context.strokeStyle = `rgba(50, 25, 10, ${Math.random() * 0.5})`;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(64, y + Math.random() * 4 - 2);
      context.stroke();
    }
    
    return new CanvasTexture(canvas);
  }

  /**
   * Create leaf texture
   */
  private createLeafTexture(): CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    
    const context = canvas.getContext('2d')!;
    
    // Green leaf color
    const gradient = context.createLinearGradient(0, 0, 64, 64);
    gradient.addColorStop(0, '#228b22');
    gradient.addColorStop(0.5, '#32cd32');
    gradient.addColorStop(1, '#006400');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    
    // Add leaf veins
    context.strokeStyle = 'rgba(0, 100, 0, 0.6)';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(32, 0);
    context.lineTo(32, 64);
    context.stroke();
    
    // Side veins
    for (let i = 1; i < 4; i++) {
      const y = (i / 4) * 64;
      context.beginPath();
      context.moveTo(32, y);
      context.lineTo(10, y + 10);
      context.stroke();
      
      context.beginPath();
      context.moveTo(32, y);
      context.lineTo(54, y + 10);
      context.stroke();
    }
    
    return new CanvasTexture(canvas);
  }

  /**
   * Create a realistic apple with stem and leaf
   */
  private createRealisticApple(config: GameConfig): void {
    // Main apple body
    const appleGeometry = new SphereGeometry(config.foodSize / 2, 16, 12);
    // Slightly flatten the apple
    appleGeometry.scale(1, 0.9, 1);
    
    const appleTexture = this.createAppleTexture();
    const appleMaterial = new MeshStandardMaterial({
      map: appleTexture,
      roughness: 0.3,
      metalness: 0.1,
      emissive: new Color(0x331111),
      emissiveIntensity: 0.1
    });
    
    this.mesh = new Mesh(appleGeometry, appleMaterial);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    // Create stem
    const stemGeometry = new CylinderGeometry(0.1, 0.15, 0.4, 8);
    const stemTexture = this.createStemTexture();
    const stemMaterial = new MeshStandardMaterial({
      map: stemTexture,
      roughness: 0.8,
      metalness: 0.0
    });
    
    this.stemMesh = new Mesh(stemGeometry, stemMaterial);
    this.stemMesh.position.set(0, config.foodSize / 2 + 0.2, 0);
    this.stemMesh.castShadow = true;
    this.stemMesh.receiveShadow = true;
    
    // Create leaf
    const leafGeometry = new SphereGeometry(0.3, 8, 6);
    leafGeometry.scale(2, 0.1, 1); // Flatten to make leaf-like
    const leafTexture = this.createLeafTexture();
    const leafMaterial = new MeshStandardMaterial({
      map: leafTexture,
      roughness: 0.6,
      metalness: 0.0,
      transparent: true,
      opacity: 0.9
    });
    
    this.leafMesh = new Mesh(leafGeometry, leafMaterial);
    this.leafMesh.position.set(0.3, config.foodSize / 2 + 0.3, 0.1);
    this.leafMesh.rotation.z = Math.PI / 6;
    this.leafMesh.castShadow = true;
    this.leafMesh.receiveShadow = true;
    
    // Add all parts to the group
    this.foodGroup.add(this.mesh);
    this.foodGroup.add(this.stemMesh);
    this.foodGroup.add(this.leafMesh);
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
    
    // Gentle rotation for the apple
    this.mesh.rotation.y += deltaTime * 0.8;
    
    // Leaf gentle swaying
    this.leafMesh.rotation.z = Math.PI / 6 + Math.sin(this.animationTime * 2.5) * 0.2;
    this.leafMesh.rotation.y = Math.sin(this.animationTime * 1.8) * 0.3;
    
    // Stem slight movement
    this.stemMesh.rotation.x = Math.sin(this.animationTime * 2.2) * 0.1;
    
    // Update glow light position and create pulsing effect
    this.glowLight.position.copy(this.foodGroup.position);
    this.glowLight.position.y += 1;
    this.glowLight.intensity = 1.5 + Math.sin(this.animationTime * 4) * 0.4;
    
    // Color variation in the light
    const colorShift = Math.sin(this.animationTime * 3) * 0.1;
    this.glowLight.color.setHSL(0.05 + colorShift, 1, 0.6); // Red-orange variation
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
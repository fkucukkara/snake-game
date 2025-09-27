import {
  BoxGeometry,
  MeshPhongMaterial,
  MeshStandardMaterial,
  Mesh,
  Vector3,
  Scene,
  Color,
  PointLight,
  CylinderGeometry,
  SphereGeometry
} from 'three';
import { SnakeSegment, Direction, GameConfig } from '@/types';
import { EventManager } from '@/engine/core/EventManager';

// Snake entity for MVP
export class Snake extends EventManager {
  private segments: SnakeSegment[] = [];
  private direction: Direction = Direction.RIGHT;
  private nextDirection: Direction = Direction.RIGHT;
  private segmentSize: number;
  private scene: Scene;
  private isGrowing: boolean = false;
  private moveTimer: number = 0;
  private moveInterval: number = 200;
  private headLight!: PointLight;

  constructor(scene: Scene, config: GameConfig) {
  super();
  this.scene = scene;
  this.segmentSize = config.segmentSize;
  this.initialize(config.initialSnakeLength);
  }

  /**
   * Initialize snake with starting segments
   */
  private initialize(length: number): void {
    // Create head light
    this.headLight = new PointLight(0x00ff44, 2, 10, 2);
    this.headLight.castShadow = true;
    this.scene.add(this.headLight);
    
    for (let i = 0; i < length; i++) {
      this.createSegment(i, -i * this.segmentSize, 0, 0);
    }
  }

  /**
   * Create a new snake segment with enhanced graphics
   */
  private createSegment(index: number, x: number, y: number, z: number): void {
    const isHead = index === 0;
    
    // Use different geometry for head
    const geometry = isHead 
      ? new SphereGeometry(this.segmentSize * 0.6, 16, 12)
      : new BoxGeometry(
          this.segmentSize * 0.9, 
          this.segmentSize * 0.9, 
          this.segmentSize * 0.9
        );
    
    // Calculate color gradient from head to tail
    const colorIntensity = Math.max(0.3, 1 - (index * 0.1));
    const baseColor = isHead ? new Color(0x00ff44) : new Color(0x00cc33);
    baseColor.multiplyScalar(colorIntensity);
    
    const material = new MeshStandardMaterial({
      color: baseColor,
      roughness: isHead ? 0.1 : 0.4,
      metalness: isHead ? 0.3 : 0.1,
      emissive: isHead ? new Color(0x002211) : new Color(0x001100),
      emissiveIntensity: isHead ? 0.2 : 0.05
    });
    
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    const segment: SnakeSegment = {
      position: mesh.position.clone(),
      rotation: mesh.quaternion.clone(),
      mesh
    };
    
    this.segments.push(segment);
    this.scene.add(mesh);
    
    // Update head light position
    if (isHead) {
      this.headLight.position.copy(mesh.position);
      this.headLight.position.y += 2;
    }
  }

  /**
   * Update snake position and movement
   */
  update(deltaTime: number): void {
    this.moveTimer += deltaTime;
    
    if (this.moveTimer >= this.moveInterval) {
      this.move();
      this.moveTimer = 0;
    }
  }

  /**
   * Move the snake forward
   */
  private move(): void {
  // Direction update
    this.direction = this.nextDirection;

  // Head position
    const head = this.segments[0];
    const newHeadPosition = head.position.clone();
    
    switch (this.direction) {
      case Direction.RIGHT:
        newHeadPosition.x += this.segmentSize;
        break;
      case Direction.LEFT:
        newHeadPosition.x -= this.segmentSize;
        break;
      case Direction.FORWARD:
        newHeadPosition.z -= this.segmentSize;
        break;
      case Direction.BACKWARD:
        newHeadPosition.z += this.segmentSize;
        break;
    }

  // Previous positions
    const previousPositions = this.segments.map(segment => segment.position.clone());

  // Head move
    head.position.copy(newHeadPosition);
    head.mesh.position.copy(newHeadPosition);
    
    // Update head light position
    this.headLight.position.copy(newHeadPosition);
    this.headLight.position.y += 2;

  // Body move
    for (let i = 1; i < this.segments.length; i++) {
      this.segments[i].position.copy(previousPositions[i - 1]);
      this.segments[i].mesh.position.copy(previousPositions[i - 1]);
    }

  // Growth
    if (this.isGrowing) {
      this.addSegment(previousPositions[previousPositions.length - 1]);
      this.isGrowing = false;
    }

  // Collisions
    if (this.checkSelfCollision() || this.checkWallCollision()) {
      this.emit('collision');
    }
  }

  /**
   * Add a new segment to the snake
   */
  private addSegment(position: Vector3): void {
    const segmentIndex = this.segments.length;
    
    const geometry = new BoxGeometry(
      this.segmentSize * 0.9, 
      this.segmentSize * 0.9, 
      this.segmentSize * 0.9
    );
    
    // Calculate color gradient
    const colorIntensity = Math.max(0.3, 1 - (segmentIndex * 0.1));
    const baseColor = new Color(0x00cc33);
    baseColor.multiplyScalar(colorIntensity);
    
    const material = new MeshStandardMaterial({
      color: baseColor,
      roughness: 0.4,
      metalness: 0.1,
      emissive: new Color(0x001100),
      emissiveIntensity: 0.05
    });
    
    const mesh = new Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    const segment: SnakeSegment = {
      position: position.clone(),
      rotation: mesh.quaternion.clone(),
      mesh
    };
    
    this.segments.push(segment);
    this.scene.add(mesh);
  }

  /**
   * Make the snake grow on next move
   */
  grow(): void {
    this.isGrowing = true;
  }

  /**
   * Set the snake's direction
   */
  setDirection(direction: Direction): void {
    // Prevent immediate direction reversal
    if (!this.isOppositeDirection(direction, this.direction)) {
      this.nextDirection = direction;
    }
  }

  /**
   * Check if new direction is opposite to current direction
   */
  private isOppositeDirection(newDir: Direction, currentDir: Direction): boolean {
    const opposites: Record<Direction, Direction> = {
      [Direction.FORWARD]: Direction.BACKWARD,
      [Direction.BACKWARD]: Direction.FORWARD,
      [Direction.LEFT]: Direction.RIGHT,
      [Direction.RIGHT]: Direction.LEFT,
      [Direction.UP]: Direction.DOWN,
      [Direction.DOWN]: Direction.UP
    };

    return opposites[newDir] === currentDir;
  }

  /**
   * Check collision with snake body
   */
  checkSelfCollision(): boolean {
    const head = this.segments[0];
    
    for (let i = 1; i < this.segments.length; i++) {
      if (head.position.distanceTo(this.segments[i].position) < this.segmentSize / 2) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check collision with arena walls
   */
  checkWallCollision(): boolean {
    const head = this.segments[0];
    const boundary = 10; // Arena boundary
    
    return (
      Math.abs(head.position.x) > boundary ||
      Math.abs(head.position.z) > boundary
    );
  }

  /**
   * Check collision with food
   */
  checkFoodCollision(foodPosition: Vector3): boolean {
    const head = this.segments[0];
    return head.position.distanceTo(foodPosition) < this.segmentSize;
  }

  /**
   * Get head position
   */
  getHeadPosition(): Vector3 {
    return this.segments[0].position.clone();
  }

  /**
   * Get all segment positions
   */
  getSegmentPositions(): Vector3[] {
    return this.segments.map(segment => segment.position.clone());
  }

  /**
   * Reset snake to initial state
   */
  reset(): void {
    // Remove all segments from scene
    this.segments.forEach(segment => {
      this.scene.remove(segment.mesh);
      segment.mesh.geometry.dispose();
      if (segment.mesh.material instanceof MeshPhongMaterial) {
        segment.mesh.material.dispose();
      }
    });
    
    this.segments = [];
    this.direction = Direction.RIGHT;
    this.nextDirection = Direction.RIGHT;
    this.isGrowing = false;
    this.moveTimer = 0;
    
    // Reinitialize
    this.initialize(3);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.segments.forEach(segment => {
      this.scene.remove(segment.mesh);
      segment.mesh.geometry.dispose();
      if (segment.mesh.material instanceof MeshStandardMaterial) {
        segment.mesh.material.dispose();
      }
    });
    
    // Clean up head light
    if (this.headLight) {
      this.scene.remove(this.headLight);
    }
    
    this.segments = [];
    this.clear();
  }
}
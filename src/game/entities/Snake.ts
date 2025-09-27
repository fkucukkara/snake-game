import {
  MeshStandardMaterial,
  Mesh,
  Vector3,
  Vector2,
  Scene,
  Color,
  PointLight,
  CylinderGeometry,
  Group,
  CanvasTexture,
  RepeatWrapping,
  BufferGeometry,
  Quaternion,
  LatheGeometry
} from 'three';
import { SnakeSegment, Direction, GameConfig } from '@/types';
import { EventManager } from '@/engine/core/EventManager';

// Snake entity with realistic graphics
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
  private snakeGroup: Group;

  constructor(scene: Scene, config: GameConfig) {
    super();
    this.scene = scene;
    this.segmentSize = config.segmentSize;
    this.snakeGroup = new Group();
    this.scene.add(this.snakeGroup);
    this.initialize(config.initialSnakeLength);
  }

  /**
   * Create realistic snake skin texture
   */
  private createSnakeTexture(isHead: boolean = false): CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    
    const context = canvas.getContext('2d')!;
    
    if (isHead) {
      // Head texture with eyes and details
      const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0, '#4a7c59');
      gradient.addColorStop(0.6, '#2d5016');
      gradient.addColorStop(1, '#1a3009');
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 256);
      
      // Add scale patterns for head
      for (let y = 0; y < 256; y += 16) {
        for (let x = 0; x < 256; x += 16) {
          const offset = (y / 16) % 2 === 0 ? 0 : 8;
          const scaleX = x + offset;
          
          // Scale outline
          context.strokeStyle = '#1a3009';
          context.lineWidth = 1;
          context.beginPath();
          context.arc(scaleX, y, 6, 0, Math.PI * 2);
          context.stroke();
          
          // Scale highlight
          context.fillStyle = '#5a8c69';
          context.beginPath();
          context.arc(scaleX - 2, y - 2, 2, 0, Math.PI * 2);
          context.fill();
        }
      }
      
      // Add eyes
      context.fillStyle = '#000000';
      context.beginPath();
      context.arc(96, 96, 8, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.arc(160, 96, 8, 0, Math.PI * 2);
      context.fill();
      
      // Eye highlights
      context.fillStyle = '#ffffff';
      context.beginPath();
      context.arc(98, 94, 3, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.arc(162, 94, 3, 0, Math.PI * 2);
      context.fill();
      
    } else {
      // Body texture with realistic snake pattern
      const gradient = context.createLinearGradient(0, 0, 0, 256);
      gradient.addColorStop(0, '#3d6b42');
      gradient.addColorStop(0.5, '#2d5016');
      gradient.addColorStop(1, '#1a3009');
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 256);
      
      // Add diamond pattern typical of snake skin
      for (let y = 0; y < 256; y += 20) {
        for (let x = 0; x < 256; x += 20) {
          const offset = (y / 20) % 2 === 0 ? 0 : 10;
          const patternX = x + offset;
          
          // Diamond shape
          context.strokeStyle = '#1a3009';
          context.lineWidth = 2;
          context.beginPath();
          context.moveTo(patternX, y - 8);
          context.lineTo(patternX + 6, y);
          context.lineTo(patternX, y + 8);
          context.lineTo(patternX - 6, y);
          context.closePath();
          context.stroke();
          
          // Inner highlight
          context.fillStyle = '#4a7c59';
          context.beginPath();
          context.moveTo(patternX, y - 4);
          context.lineTo(patternX + 3, y);
          context.lineTo(patternX, y + 4);
          context.lineTo(patternX - 3, y);
          context.closePath();
          context.fill();
        }
      }
      
      // Add random spots and variations
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const size = Math.random() * 4 + 2;
        
        context.fillStyle = `rgba(26, 48, 9, ${Math.random() * 0.5})`;
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
      }
    }
    
    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    return texture;
  }

  /**
   * Initialize snake with starting segments
   */
  private initialize(length: number): void {
    // Create head light
    this.headLight = new PointLight(0x4a7c59, 2, 12, 2);
    this.headLight.castShadow = true;
    this.scene.add(this.headLight);
    
    for (let i = 0; i < length; i++) {
      this.createRealisticSegment(i, -i * this.segmentSize, 0, 0);
    }
  }

  /**
   * Create a realistic snake segment with organic geometry
   */
  private createRealisticSegment(index: number, x: number, y: number, z: number): void {
    const isHead = index === 0;
    
    let geometry: BufferGeometry;
    let material: MeshStandardMaterial;
    
    if (isHead) {
      // Create head with more organic shape using Vector2 for LatheGeometry
      const headPoints = [];
      for (let i = 0; i <= 10; i++) {
        const angle = (i / 10) * Math.PI;
        const radius = Math.sin(angle) * 0.7;
        const y = (i / 10) * this.segmentSize - this.segmentSize * 0.5;
        headPoints.push(new Vector2(radius, y));
      }
      
      geometry = new LatheGeometry(headPoints, 16);
      
      const headTexture = this.createSnakeTexture(true);
      material = new MeshStandardMaterial({
        map: headTexture,
        normalMap: headTexture, // Use same texture as normal map for more detail
        roughness: 0.3,
        metalness: 0.1,
        emissive: new Color(0x0a1a0a),
        emissiveIntensity: 0.1
      });
      
    } else {
      // Create body segments with organic cylindrical shape
      const radiusTop = this.segmentSize * 0.5;
      const radiusBottom = this.segmentSize * 0.48; // Slight taper
      const height = this.segmentSize * 0.9;
      const segments = 16;
      
      geometry = new CylinderGeometry(radiusTop, radiusBottom, height, segments, 1);
      
      // Calculate color gradient from head to tail
      const colorIntensity = Math.max(0.4, 1 - (index * 0.08));
      
      const bodyTexture = this.createSnakeTexture(false);
      
      material = new MeshStandardMaterial({
        map: bodyTexture,
        roughness: 0.4,
        metalness: 0.05,
        emissive: new Color(0x0a1a0a),
        emissiveIntensity: 0.05
      });
      
      // Adjust material based on position
      const baseColor = new Color(0x3d6b42);
      baseColor.multiplyScalar(colorIntensity);
      material.color = baseColor;
    }
    
    const mesh = new Mesh(geometry, material);
    
    // Position and rotate segment
    mesh.position.set(x, y, z);
    if (!isHead) {
      mesh.rotation.x = Math.PI / 2; // Align cylinder along Z axis
    }
    
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Add subtle random rotation for more organic look
    mesh.rotation.y += (Math.random() - 0.5) * 0.2;
    
    const segment: SnakeSegment = {
      position: mesh.position.clone(),
      rotation: mesh.quaternion.clone(),
      mesh
    };
    
    this.segments.push(segment);
    this.snakeGroup.add(mesh);
    
    // Update head light position
    if (isHead) {
      this.headLight.position.copy(mesh.position);
      this.headLight.position.y += 2;
    }
  }

  /**
   * Update snake position and movement with smoother animations
   */
  update(deltaTime: number): void {
    this.moveTimer += deltaTime;
    
    // Add subtle body animation even when not moving
    this.animateBody(deltaTime);
    
    if (this.moveTimer >= this.moveInterval) {
      this.move();
      this.moveTimer = 0;
    }
  }

  /**
   * Add subtle breathing/organic animation to snake body
   */
  private animateBody(_deltaTime: number): void {
    const time = Date.now() * 0.001;
    
    this.segments.forEach((segment, index) => {
      if (index > 0) { // Skip head
        const wave = Math.sin(time * 2 + index * 0.5) * 0.05;
        segment.mesh.scale.y = 1 + wave;
        
        // Subtle side-to-side motion
        const sway = Math.sin(time * 1.5 + index * 0.3) * 0.02;
        segment.mesh.position.x = segment.position.x + sway;
      }
    });
  }

  /**
   * Move the snake forward with enhanced smoothness
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

    // Store previous positions
    const previousPositions = this.segments.map(segment => segment.position.clone());

    // Move head
    head.position.copy(newHeadPosition);
    head.mesh.position.copy(newHeadPosition);
    
    // Rotate head to face movement direction
    this.rotateHeadToDirection();
    
    // Update head light position
    this.headLight.position.copy(newHeadPosition);
    this.headLight.position.y += 2;

    // Move body segments with smooth following
    for (let i = 1; i < this.segments.length; i++) {
      this.segments[i].position.copy(previousPositions[i - 1]);
      this.segments[i].mesh.position.copy(previousPositions[i - 1]);
      
      // Add organic segment rotation based on movement
      if (i < this.segments.length - 1) {
        const currentPos = this.segments[i].position;
        const nextPos = this.segments[i + 1].position;
        const direction = new Vector3().subVectors(currentPos, nextPos).normalize();
        
        this.segments[i].mesh.lookAt(currentPos.clone().add(direction));
        this.segments[i].mesh.rotateX(Math.PI / 2); // Correct orientation
      }
    }

    // Growth
    if (this.isGrowing) {
      this.addRealisticSegment(previousPositions[previousPositions.length - 1]);
      this.isGrowing = false;
    }

    // Collisions
    if (this.checkSelfCollision() || this.checkWallCollision()) {
      this.emit('collision');
    }
  }

  /**
   * Rotate snake head to face movement direction
   */
  private rotateHeadToDirection(): void {
    const head = this.segments[0];
    const targetRotation = new Quaternion();
    
    switch (this.direction) {
      case Direction.RIGHT:
        targetRotation.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);
        break;
      case Direction.LEFT:
        targetRotation.setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2);
        break;
      case Direction.FORWARD:
        targetRotation.setFromAxisAngle(new Vector3(0, 1, 0), 0);
        break;
      case Direction.BACKWARD:
        targetRotation.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI);
        break;
    }
    
    head.mesh.quaternion.slerp(targetRotation, 0.3);
  }

  /**
   * Add a new realistic segment to the snake
   */
  private addRealisticSegment(position: Vector3): void {
    const segmentIndex = this.segments.length;
    this.createRealisticSegment(segmentIndex, position.x, position.y, position.z);
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
      this.snakeGroup.remove(segment.mesh);
      segment.mesh.geometry.dispose();
      if (segment.mesh.material instanceof MeshStandardMaterial) {
        segment.mesh.material.dispose();
        // Dispose textures
        if (segment.mesh.material.map) {
          segment.mesh.material.map.dispose();
        }
        if (segment.mesh.material.normalMap) {
          segment.mesh.material.normalMap.dispose();
        }
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
      this.snakeGroup.remove(segment.mesh);
      segment.mesh.geometry.dispose();
      if (segment.mesh.material instanceof MeshStandardMaterial) {
        segment.mesh.material.dispose();
        // Dispose textures
        if (segment.mesh.material.map) {
          segment.mesh.material.map.dispose();
        }
        if (segment.mesh.material.normalMap) {
          segment.mesh.material.normalMap.dispose();
        }
      }
    });
    
    // Clean up head light
    if (this.headLight) {
      this.scene.remove(this.headLight);
    }
    
    // Remove snake group
    this.scene.remove(this.snakeGroup);
    
    this.segments = [];
    this.clear();
  }
}
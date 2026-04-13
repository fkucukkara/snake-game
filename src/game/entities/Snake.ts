import {
  MeshStandardMaterial,
  Mesh,
  Vector3,
  Scene,
  Color,
  PointLight,
  Group,
  CanvasTexture,
  RepeatWrapping,
  CatmullRomCurve3,
  TubeGeometry
} from 'three';
import { Direction, GameConfig } from '@/types';
import { EventManager } from '@/engine/core/EventManager';

export interface SnakeSegment {
  position: Vector3;
}

export class Snake extends EventManager {
  private segments: SnakeSegment[] = [];
  private visualSegments: Vector3[] = [];
  private direction: Direction = Direction.RIGHT;
  private nextDirection: Direction = Direction.RIGHT;
  private segmentSize: number;
  private scene: Scene;
  private isGrowing: boolean = false;
  private moveTimer: number = 0;
  private baseMoveInterval: number = 150;
  private headLight!: PointLight;
  private snakeGroup: Group;
  private eatPulseTimeRemaining: number = 0;
  private readonly eatPulseDuration: number = 220;
  private readonly baseHeadLightIntensity: number = 4;
  
  private tubeMesh!: Mesh;
  private isDashing: boolean = false;
  private texture!: CanvasTexture;

  constructor(scene: Scene, config: GameConfig) {
    super();
    this.scene = scene;
    this.segmentSize = config.segmentSize;
    this.snakeGroup = new Group();
    this.scene.add(this.snakeGroup);
    this.initialize(config.initialSnakeLength);
  }

  private createSnakeTexture(): CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    
    const gradient = context.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#00ffff');
    gradient.addColorStop(0.5, '#0066ff');
    gradient.addColorStop(1, '#3300aa');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    
    // Add grid/circuit pattern
    for (let y = 0; y < 256; y += 32) {
      context.strokeStyle = 'rgba(0, 255, 255, 0.4)';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(256, y);
      context.stroke();
    }
    
    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(1, 10); // Repeat along tube
    return texture;
  }

  private initialize(length: number): void {
    this.headLight = new PointLight(0x00ffff, this.baseHeadLightIntensity, 18, 2);
    this.headLight.castShadow = true;
    this.headLight.shadow.mapSize.width = 1024;
    this.headLight.shadow.mapSize.height = 1024;
    this.scene.add(this.headLight);
    
    // Create segments
    for (let i = 0; i < length; i++) {
        const pos = new Vector3(-i * this.segmentSize, 0, 0);
        this.segments.push({ position: pos.clone() });
        this.visualSegments.push(pos.clone());
    }

    // Material
    this.texture = this.createSnakeTexture();
    const material = new MeshStandardMaterial({
      map: this.texture,
      roughness: 0.1,
      metalness: 0.8,
      emissive: new Color(0x0088ff),
      emissiveIntensity: 0.5,
      envMapIntensity: 1.5
    });

    this.tubeMesh = new Mesh(new TubeGeometry(this.getCurve(), 64, this.segmentSize * 0.45, 8, false), material);
    this.tubeMesh.castShadow = true;
    this.tubeMesh.receiveShadow = true;
    this.snakeGroup.add(this.tubeMesh);
    
    this.headLight.position.copy(this.visualSegments[0]);
    this.headLight.position.y += 2;
  }

  private getCurve(): CatmullRomCurve3 {
    // If only one segment, CatmullRomCurve3 needs at least 2 points
    const points = this.visualSegments.length > 1 ? this.visualSegments : [this.visualSegments[0], this.visualSegments[0].clone().add(new Vector3(0.1,0,0))];
    return new CatmullRomCurve3(points, false, 'catmullrom', 0.5);
  }

  update(deltaTime: number): void {
    this.moveTimer += deltaTime;
    this.eatPulseTimeRemaining = Math.max(0, this.eatPulseTimeRemaining - deltaTime);

    // Animating texture
    if (this.texture) {
       this.texture.offset.x -= deltaTime * 0.002 * (this.isDashing ? 2 : 1);
    }
    
    const moveInterval = this.isDashing ? this.baseMoveInterval * 0.4 : this.baseMoveInterval;
    
    if (this.moveTimer >= moveInterval) {
      this.move();
      // Ensure we don't build up too much time if frame drops
      this.moveTimer = this.moveTimer > moveInterval * 2 ? 0 : this.moveTimer - moveInterval;
    }

    // Lerp visual segments
    const lerpFactor = Math.min(1.0, deltaTime * 0.02 * (this.isDashing ? 1.5 : 1.0));
    for (let i = 0; i < this.segments.length; i++) {
       // if we have visual segments lagging, push one if needed
       if (!this.visualSegments[i]) {
           this.visualSegments[i] = this.segments[i].position.clone();
       }
       this.visualSegments[i].lerp(this.segments[i].position, lerpFactor);
    }

    // Add eat pulse effect to radius interpolation if desired
    const eatPulse = this.eatPulseTimeRemaining > 0 ? Math.sin((1 - this.eatPulseTimeRemaining / this.eatPulseDuration) * Math.PI) : 0;
    this.headLight.intensity = this.baseHeadLightIntensity + eatPulse * 3;

    // Update geometry
    if (this.tubeMesh.geometry) {
        this.tubeMesh.geometry.dispose();
    }
    const radius = this.segmentSize * 0.45 + (eatPulse * 0.1);
    this.tubeMesh.geometry = new TubeGeometry(this.getCurve(), Math.max(20, this.visualSegments.length * 4), radius, 8, false);

    // Update headlight
    this.headLight.position.copy(this.visualSegments[0]);
    this.headLight.position.y += 2;
  }

  private move(): void {
    this.direction = this.nextDirection;

    const head = this.segments[0];
    const newHeadPosition = head.position.clone();
    
    switch (this.direction) {
      case Direction.RIGHT: newHeadPosition.x += this.segmentSize; break;
      case Direction.LEFT: newHeadPosition.x -= this.segmentSize; break;
      case Direction.FORWARD: newHeadPosition.z -= this.segmentSize; break;
      case Direction.BACKWARD: newHeadPosition.z += this.segmentSize; break;
    }

    const previousPositions = this.segments.map(s => s.position.clone());

    // Move logic segments
    head.position.copy(newHeadPosition);
    for (let i = 1; i < this.segments.length; i++) {
      this.segments[i].position.copy(previousPositions[i - 1]);
    }

    if (this.isGrowing) {
      this.segments.push({ position: previousPositions[previousPositions.length - 1] });
      // Keep visual segment clumped at tail until it lerps out
      this.visualSegments.push(this.visualSegments[this.visualSegments.length - 1].clone());
      this.isGrowing = false;
    }

    if (this.checkSelfCollision() || this.checkWallCollision()) {
      this.emit('collision');
    }
  }

  setDash(dashing: boolean): void {
      this.isDashing = dashing;
  }

  grow(): void {
    this.isGrowing = true;
  }

  triggerEatAnimation(): void {
    this.eatPulseTimeRemaining = this.eatPulseDuration;
  }

  setDirection(direction: Direction): void {
    if (!this.isOppositeDirection(direction, this.direction)) {
      this.nextDirection = direction;
    }
  }

  private isOppositeDirection(newDir: Direction, currentDir: Direction): boolean {
    const opposites: Record<string, Direction> = {
      [Direction.FORWARD]: Direction.BACKWARD,
      [Direction.BACKWARD]: Direction.FORWARD,
      [Direction.LEFT]: Direction.RIGHT,
      [Direction.RIGHT]: Direction.LEFT
    };
    return opposites[newDir] === currentDir;
  }

  checkSelfCollision(): boolean {
    const head = this.segments[0];
    for (let i = 1; i < this.segments.length; i++) {
      if (head.position.distanceTo(this.segments[i].position) < this.segmentSize / 2) {
        return true;
      }
    }
    return false;
  }

  checkWallCollision(): boolean {
    const head = this.segments[0];
    const boundary = 20; 
    return (Math.abs(head.position.x) > boundary || Math.abs(head.position.z) > boundary);
  }

  checkFoodCollision(foodPosition: Vector3): boolean {
    return this.segments[0].position.distanceTo(foodPosition) < this.segmentSize;
  }

  getHeadPosition(): Vector3 {
    return this.visualSegments[0].clone(); // Visual position for camera to follow closely
  }

  getSegmentPositions(): Vector3[] {
    return this.segments.map(s => s.position.clone()); // Logical positions for food spawn check
  }

  reset(): void {
    this.segments = [];
    this.visualSegments = [];
    this.direction = Direction.RIGHT;
    this.nextDirection = Direction.RIGHT;
    this.isGrowing = false;
    this.moveTimer = 0;
    this.eatPulseTimeRemaining = 0;
    this.isDashing = false;
    if (this.tubeMesh && this.tubeMesh.geometry) {
        this.tubeMesh.geometry.dispose();
    }
    this.snakeGroup.remove(this.tubeMesh);
    if(this.headLight) {
        this.scene.remove(this.headLight);
    }
    this.initialize(3);
  }

  destroy(): void {
    this.snakeGroup.remove(this.tubeMesh);
    if (this.tubeMesh && this.tubeMesh.geometry) {
        this.tubeMesh.geometry.dispose();
    }
    if (this.tubeMesh && this.tubeMesh.material instanceof MeshStandardMaterial) {
       this.tubeMesh.material.dispose();
    }
    if (this.texture) {
        this.texture.dispose();
    }
    if (this.headLight) this.scene.remove(this.headLight);
    this.scene.remove(this.snakeGroup);
    this.segments = [];
    this.visualSegments = [];
    this.clear();
  }
}
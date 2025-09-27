import {
  PlaneGeometry,
  MeshStandardMaterial,
  Mesh,
  Scene,
  Color,
  BoxGeometry,
  RepeatWrapping,
  CanvasTexture
} from 'three';

/**
 * Arena entity that creates the game boundaries and floor
 */
export class Arena {
  private scene: Scene;
  private floor!: Mesh;
  private walls: Mesh[] = [];

  constructor(scene: Scene, size: number = 20) {
    this.scene = scene;
    
    this.createFloor(size);
    this.createWalls(size);
  }

  /**
   * Create a procedural floor texture
   */
  private createFloorTexture(): CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    
    const context = canvas.getContext('2d')!;
    
    // Create a grid pattern
    context.fillStyle = '#1a1a2e';
    context.fillRect(0, 0, 512, 512);
    
    // Grid lines
    context.strokeStyle = '#2c3e50';
    context.lineWidth = 2;
    
    const gridSize = 32;
    for (let x = 0; x <= 512; x += gridSize) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, 512);
      context.stroke();
    }
    
    for (let y = 0; y <= 512; y += gridSize) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(512, y);
      context.stroke();
    }
    
    // Add some noise/variation
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 4 + 1;
      
      context.fillStyle = `rgba(60, 80, 120, ${Math.random() * 0.3})`;
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    }
    
    return new CanvasTexture(canvas);
  }

  /**
   * Create the arena floor
   */
  private createFloor(size: number): void {
    const geometry = new PlaneGeometry(size, size, 20, 20);
    
    // Create a procedural texture for the floor
    const floorTexture = this.createFloorTexture();
    floorTexture.wrapS = RepeatWrapping;
    floorTexture.wrapT = RepeatWrapping;
    floorTexture.repeat.set(2, 2);
    
    const material = new MeshStandardMaterial({
      color: new Color(0x2c3e50),
      map: floorTexture,
      roughness: 0.8,
      metalness: 0.2
    });
    
    this.floor = new Mesh(geometry, material);
    this.floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    this.floor.position.y = -0.5;
    this.floor.receiveShadow = true;
    
    this.scene.add(this.floor);
  }

  /**
   * Create arena boundary walls
   */
  private createWalls(size: number): void {
    const wallHeight = 3;
    const wallThickness = 0.5;
    
    const wallGeometry = new BoxGeometry(wallThickness, wallHeight, size + wallThickness * 2);
    const wallMaterial = new MeshStandardMaterial({
      color: new Color(0x34495e),
      roughness: 0.7,
      metalness: 0.1,
      emissive: new Color(0x112233),
      emissiveIntensity: 0.1
    });
    
    // Create 4 walls
    const wallPositions = [
      { x: size/2 + wallThickness/2, y: wallHeight/2, z: 0 },   // Right wall
      { x: -size/2 - wallThickness/2, y: wallHeight/2, z: 0 },  // Left wall
    ];
    
    wallPositions.forEach(pos => {
      const wall = new Mesh(wallGeometry, wallMaterial.clone());
      wall.position.set(pos.x, pos.y, pos.z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      
      this.walls.push(wall);
      this.scene.add(wall);
    });
    
    // Front and back walls (rotated)
    const wallGeometryRotated = new BoxGeometry(size + wallThickness * 2, wallHeight, wallThickness);
    const frontBackPositions = [
      { x: 0, y: wallHeight/2, z: size/2 + wallThickness/2 },   // Front wall
      { x: 0, y: wallHeight/2, z: -size/2 - wallThickness/2 }   // Back wall
    ];
    
    frontBackPositions.forEach(pos => {
      const wall = new Mesh(wallGeometryRotated, wallMaterial.clone());
      wall.position.set(pos.x, pos.y, pos.z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      
      this.walls.push(wall);
      this.scene.add(wall);
    });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.floor) {
      this.scene.remove(this.floor);
      this.floor.geometry.dispose();
      if (this.floor.material instanceof MeshStandardMaterial) {
        this.floor.material.dispose();
        if (this.floor.material.map) {
          this.floor.material.map.dispose();
        }
      }
    }
    
    this.walls.forEach(wall => {
      this.scene.remove(wall);
      wall.geometry.dispose();
      if (wall.material instanceof MeshStandardMaterial) {
        wall.material.dispose();
      }
    });
    
    this.walls = [];
  }
}
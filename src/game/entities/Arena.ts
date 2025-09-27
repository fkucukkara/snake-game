import {
  PlaneGeometry,
  MeshPhongMaterial,
  Mesh,
  Scene,
  Color,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments
} from 'three';

/**
 * Arena entity that creates the game boundaries and floor
 */
export class Arena {
  private scene: Scene;
  private floor!: Mesh;
  private walls!: LineSegments;

  constructor(scene: Scene, size: number = 20) {
    this.scene = scene;
    
    this.createFloor(size);
    this.createWalls(size);
  }

  /**
   * Create the arena floor
   */
  private createFloor(size: number): void {
    const geometry = new PlaneGeometry(size, size);
    const material = new MeshPhongMaterial({
      color: new Color(0x2c3e50),
      transparent: true,
      opacity: 0.8
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
    const wallGeometry = new PlaneGeometry(size, 2);
    const edges = new EdgesGeometry(wallGeometry);
    const material = new LineBasicMaterial({ 
      color: new Color(0xffffff),
      linewidth: 2
    });
    
    this.walls = new LineSegments(edges, material);
    
    // Create 4 walls
    const wallPositions = [
      { x: 0, y: 1, z: size/2 },   // Front wall
      { x: 0, y: 1, z: -size/2 },  // Back wall
      { x: size/2, y: 1, z: 0 },   // Right wall
      { x: -size/2, y: 1, z: 0 }   // Left wall
    ];
    
    wallPositions.forEach((pos, index) => {
      const wall = this.walls.clone();
      wall.position.set(pos.x, pos.y, pos.z);
      
      // Rotate side walls
      if (index >= 2) {
        wall.rotation.y = Math.PI / 2;
      }
      
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
      if (this.floor.material instanceof MeshPhongMaterial) {
        this.floor.material.dispose();
      }
    }
    
    if (this.walls) {
      this.scene.remove(this.walls);
      this.walls.geometry.dispose();
      if (this.walls.material instanceof LineBasicMaterial) {
        this.walls.material.dispose();
      }
    }
  }
}
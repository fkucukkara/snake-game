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
   * Create a procedural nature-themed floor texture
   */
  private createFloorTexture(): CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    
    const context = canvas.getContext('2d')!;
    
    // Create a grass-like base
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#2d5a2d');
    gradient.addColorStop(0.5, '#1a3d1a');
    gradient.addColorStop(1, '#0f2e0f');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);
    
    // Add grass texture with small strokes
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const length = Math.random() * 8 + 4;
      const angle = Math.random() * Math.PI * 2;
      
      context.strokeStyle = `rgba(${50 + Math.random() * 40}, ${80 + Math.random() * 40}, ${30 + Math.random() * 30}, ${0.3 + Math.random() * 0.4})`;
      context.lineWidth = 1 + Math.random() * 2;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      context.stroke();
    }
    
    // Add some dirt patches
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 30 + 15;
      
      context.fillStyle = `rgba(139, 69, 19, ${Math.random() * 0.3 + 0.1})`;
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    }
    
    // Add small rocks/pebbles
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 4 + 2;
      
      context.fillStyle = `rgba(105, 105, 105, ${Math.random() * 0.4 + 0.2})`;
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    }
    
    return new CanvasTexture(canvas);
  }

  /**
   * Create the arena floor with natural appearance
   */
  private createFloor(size: number): void {
    const geometry = new PlaneGeometry(size, size, 32, 32);
    
    // Add subtle height variations to make it more natural
    const vertices = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < vertices.length; i += 3) {
      // Add small random height variations
      vertices[i + 1] += (Math.random() - 0.5) * 0.1;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals(); // Recalculate normals after height changes
    
    // Create a procedural texture for natural ground
    const floorTexture = this.createFloorTexture();
    floorTexture.wrapS = RepeatWrapping;
    floorTexture.wrapT = RepeatWrapping;
    floorTexture.repeat.set(3, 3);
    
    const material = new MeshStandardMaterial({
      color: new Color(0x2d5a2d),
      map: floorTexture,
      roughness: 0.9,
      metalness: 0.0
    });
    
    this.floor = new Mesh(geometry, material);
    this.floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    this.floor.position.y = -0.5;
    this.floor.receiveShadow = true;
    
    this.scene.add(this.floor);
  }

  /**
   * Create natural-looking arena boundary walls
   */
  private createWalls(size: number): void {
    const wallHeight = 4;
    const wallThickness = 0.8;
    
    // Create stone/rock wall texture
    const createWallTexture = (): CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      
      const context = canvas.getContext('2d')!;
      
      // Stone base color
      const gradient = context.createLinearGradient(0, 0, 0, 256);
      gradient.addColorStop(0, '#5d4037');
      gradient.addColorStop(0.5, '#4e342e');
      gradient.addColorStop(1, '#3e2723');
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 256);
      
      // Add stone texture with irregular shapes
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const width = Math.random() * 40 + 20;
        const height = Math.random() * 30 + 15;
        
        context.fillStyle = `rgba(${95 + Math.random() * 30}, ${64 + Math.random() * 20}, ${55 + Math.random() * 15}, ${0.3 + Math.random() * 0.4})`;
        context.fillRect(x, y, width, height);
      }
      
      // Add cracks and details
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const length = Math.random() * 50 + 10;
        const angle = Math.random() * Math.PI * 2;
        
        context.strokeStyle = `rgba(30, 20, 15, ${0.5 + Math.random() * 0.3})`;
        context.lineWidth = 1 + Math.random() * 2;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        context.stroke();
      }
      
      const texture = new CanvasTexture(canvas);
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      return texture;
    };
    
    const wallTexture = createWallTexture();
    const wallGeometry = new BoxGeometry(wallThickness, wallHeight, size + wallThickness * 2);
    const wallMaterial = new MeshStandardMaterial({
      color: new Color(0x5d4037),
      map: wallTexture,
      roughness: 0.9,
      metalness: 0.0,
      emissive: new Color(0x1a0e0a),
      emissiveIntensity: 0.05
    });
    
    // Create 4 walls with natural stone appearance
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
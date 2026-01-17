import {
  PlaneGeometry,
  MeshStandardMaterial,
  Mesh,
  Scene,
  Color,
  BoxGeometry,
  RepeatWrapping,
  CanvasTexture,
  Vector2
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
   * Create a modern grid floor texture with neon accents
   */
  private createFloorTexture(): CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    
    const context = canvas.getContext('2d')!;
    
    // Modern dark blue-purple base
    const gradient = context.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#0a0e1a');
    gradient.addColorStop(0.5, '#1a1f2e');
    gradient.addColorStop(1, '#0a0e1a');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);
    
    // Draw grid pattern with neon cyan lines
    const gridSize = 32;
    context.strokeStyle = 'rgba(0, 255, 255, 0.3)'; // Cyan grid lines
    context.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= 512; x += gridSize) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, 512);
      context.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= 512; y += gridSize) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(512, y);
      context.stroke();
    }
    
    // Highlight major grid lines (every 4th line)
    context.strokeStyle = 'rgba(0, 255, 255, 0.5)';
    context.lineWidth = 2;
    
    for (let x = 0; x <= 512; x += gridSize * 4) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, 512);
      context.stroke();
    }
    
    for (let y = 0; y <= 512; y += gridSize * 4) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(512, y);
      context.stroke();
    }
    
    // Add subtle glow dots at intersections
    for (let x = 0; x <= 512; x += gridSize * 4) {
      for (let y = 0; y <= 512; y += gridSize * 4) {
        context.fillStyle = 'rgba(0, 255, 255, 0.2)';
        context.beginPath();
        context.arc(x, y, 2, 0, Math.PI * 2);
        context.fill();
      }
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
      color: new Color(0x1a1f2e),
      map: floorTexture,
      roughness: 0.3, // Smooth, reflective surface
      metalness: 0.7, // Metallic appearance
      emissive: new Color(0x001122), // Subtle cyan glow
      emissiveIntensity: 0.15,
      envMapIntensity: 0.8 // Strong environment reflections for modern look
    });
    
    this.floor = new Mesh(geometry, material);
    this.floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    this.floor.position.y = -0.5;
    this.floor.receiveShadow = true;
    
    this.scene.add(this.floor);
  }

  /**
   * Create sleek modern arena boundary walls with neon accents
   */
  private createWalls(size: number): void {
    const wallHeight = 4;
    const wallThickness = 0.8;
    
    // Create modern metallic wall texture with neon lines
    const createWallTexture = (): CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      
      const context = canvas.getContext('2d')!;
      
      // Dark metallic base
      const gradient = context.createLinearGradient(0, 0, 0, 256);
      gradient.addColorStop(0, '#1a1f2e');
      gradient.addColorStop(0.5, '#0f1419');
      gradient.addColorStop(1, '#0a0e1a');
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 256);
      
      // Add horizontal neon accent lines
      for (let y = 0; y < 256; y += 64) {
        context.fillStyle = 'rgba(0, 255, 255, 0.4)';
        context.fillRect(0, y, 256, 2);
      }
      
      // Add vertical accent lines at edges
      context.fillStyle = 'rgba(255, 102, 204, 0.3)';
      context.fillRect(0, 0, 4, 256);
      context.fillRect(252, 0, 4, 256);
      
      // Add subtle hexagonal pattern for tech aesthetic
      const hexSize = 32;
      context.strokeStyle = 'rgba(0, 255, 255, 0.1)';
      context.lineWidth = 1;
      for (let x = 0; x < 256; x += hexSize) {
        for (let y = 0; y < 256; y += hexSize * 1.5) {
          context.beginPath();
          context.arc(x + (y % (hexSize * 1.5) === 0 ? 0 : hexSize / 2), y, hexSize / 3, 0, Math.PI * 2);
          context.stroke();
        }
      }
      
      const texture = new CanvasTexture(canvas);
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      return texture;
    };
    
    const wallTexture = createWallTexture();
    const wallGeometry = new BoxGeometry(wallThickness, wallHeight, size + wallThickness * 2);
    const wallMaterial = new MeshStandardMaterial({
      color: new Color(0x1a1f2e),
      map: wallTexture,
      roughness: 0.2, // Smooth, reflective surface
      metalness: 0.8, // Highly metallic
      emissive: new Color(0x001122),
      emissiveIntensity: 0.2, // Brighter neon glow
      envMapIntensity: 1.0 // Strong reflections for glass-like effect
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
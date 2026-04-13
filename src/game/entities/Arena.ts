import {
  PlaneGeometry,
  MeshStandardMaterial,
  Mesh,
  Scene,
  Color,
  BoxGeometry,
  RepeatWrapping,
  CanvasTexture,
  ShaderMaterial,
  DoubleSide
} from 'three';

/**
 * Arena entity that creates the game boundaries and floor
 */
export class Arena {
  private scene: Scene;
  private floor!: Mesh;
  private walls: Mesh[] = [];
  private time: number = 0;

  constructor(scene: Scene, size: number = 20) {
    this.scene = scene;
    
    this.createFloor(size);
    this.createWalls(size);
  }



  /**
   * Create the arena floor with natural appearance
   */
  private createFloor(size: number): void {
    const geometry = new PlaneGeometry(size, size, 1, 1);
    
    const material = new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new Color(0x0a0e1a) }, // Dark background
        color2: { value: new Color(0x00ffff) }, // Cyan grid lines
        gridSize: { value: size / 2 } // number of grid blocks
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float gridSize;
        varying vec2 vUv;
        
        void main() {
           vec2 grid = fract(vUv * gridSize);
           // draw grid lines with anti-aliasing approximation via smoothstep
           float lineX = smoothstep(0.0, 0.05, grid.x) * smoothstep(1.0, 0.95, grid.x);
           float lineY = smoothstep(0.0, 0.05, grid.y) * smoothstep(1.0, 0.95, grid.y);
           float line = 1.0 - (lineX * lineY);
           
           // Center pulse glow
           float centerDist = length(vUv - vec2(0.5));
           float pulse = max(0.0, sin(time * 3.0 - centerDist * 15.0));
           pulse = pow(pulse, 2.0); // Make it sharper
           
           vec3 finalColor = mix(color1, color2 * (0.8 + pulse), line);
           gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: DoubleSide
    });
    
    this.floor = new Mesh(geometry, material);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -0.5;
    this.floor.receiveShadow = true;
    
    this.scene.add(this.floor);
  }

  update(deltaTime: number): void {
    this.time += deltaTime * 0.001; // convert to seconds
    if (this.floor && this.floor.material instanceof ShaderMaterial) {
      this.floor.material.uniforms.time.value = this.time;
    }
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
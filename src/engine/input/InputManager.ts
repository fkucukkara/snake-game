import { EventManager } from '@/engine/core/EventManager';
import { Direction } from '@/types';

/**
 * Manages keyboard input for the game
 */
export class InputManager extends EventManager {
  private keys: Set<string> = new Set();
  private getCurrentDirection: (() => Direction) | null = null;

  constructor() {
    super();
    this.setupEventListeners();
  }
  
  /**
   * Register a callback to get the current snake direction
   */
  registerDirectionGetter(getter: () => Direction): void {
    this.getCurrentDirection = getter;
  }

  /**
   * Setup keyboard event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener('keydown', (event) => this.onKeyDown(event));
    window.addEventListener('keyup', (event) => this.onKeyUp(event));
  }

  /**
   * Handle keydown events
   */
  private onKeyDown(event: KeyboardEvent): void {
    const key = event.code;
    
    if (this.keys.has(key)) return; // Prevent key repeat
    
    this.keys.add(key);

    // Prevent default browser behavior for game keys
    if (this.isGameKey(key)) {
      event.preventDefault();
    }

    this.handleGameInput(key);
  }

  /**
   * Handle keyup events
   */
  private onKeyUp(event: KeyboardEvent): void {
    this.keys.delete(event.code);
  }

  /**
   * Check if key is a game control key
   */
  private isGameKey(key: string): boolean {
    const gameKeys = [
      'KeyW', 'KeyA', 'KeyS', 'KeyD',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Space'
    ];
    return gameKeys.includes(key);
  }

  /**
   * Handle game-specific input
   */
  private handleGameInput(key: string): void {
    let newDirection: Direction | null = null;

    switch (key) {
      case 'KeyW':
      case 'ArrowUp':
        newDirection = Direction.FORWARD;
        break;
      case 'KeyS':
      case 'ArrowDown':
        newDirection = Direction.BACKWARD;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        newDirection = Direction.LEFT;
        break;
      case 'KeyD':
      case 'ArrowRight':
        newDirection = Direction.RIGHT;
        break;
      case 'Space':
        this.emit('pause');
        break;
    }

    if (newDirection && this.getCurrentDirection) {
      const currentDirection = this.getCurrentDirection();
      // Prevent immediate direction reversal
      if (!this.isOppositeDirection(newDirection, currentDirection)) {
        this.emit('direction_change', newDirection);
      }
    }
  }

  /**
   * Check if new direction is opposite to current direction
   */
  private isOppositeDirection(newDir: Direction, currentDir: Direction | null): boolean {
    if (!currentDir) return false;

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
   * Check if a key is currently pressed
   */
  isKeyPressed(key: string): boolean {
    return this.keys.has(key);
  }

  /**
   * Reset input state
   */
  reset(): void {
    this.keys.clear();
  // Removed redundant lastDirection assignment
  }

  /**
   * Cleanup event listeners
   */
  destroy(): void {
    window.removeEventListener('keydown', (event) => this.onKeyDown(event));
    window.removeEventListener('keyup', (event) => this.onKeyUp(event));
    this.clear();
  }
}
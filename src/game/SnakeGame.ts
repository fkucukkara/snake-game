import { Renderer, ParticleSystem } from '@/engine/graphics';
import { InputManager } from '@/engine/input/InputManager';
import { Snake } from '@/game/entities/Snake';
import { Food } from '@/game/entities/Food';
import { Arena } from '@/game/entities/Arena';
import { GameState, Direction, GameConfig } from '@/types';

// Main game class for MVP
export class SnakeGame {
  private renderer: Renderer;
  private inputManager: InputManager;
  private snake: Snake;
  private food: Food;
  private arena: Arena;
  private particles!: ParticleSystem;
  
  private gameState: GameState = GameState.MENU;
  private score: number = 0;
  private highScore: number = 0;
  private lastTime: number = 0;
  private animationFrameId: number = 0;

  private config: GameConfig = {
    arenaSize: 40,
    snakeSpeed: 5,
    segmentSize: 2,
    foodSize: 1.5,
    initialSnakeLength: 3
  };

  // UI elements
  private scoreElement: HTMLElement;
  private highScoreElement: HTMLElement;
  private startScreenElement: HTMLElement;
  private gameOverElement: HTMLElement;
  private finalScoreElement: HTMLElement;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
    this.inputManager = new InputManager();
    
    // Initialize particle system
    this.particles = new ParticleSystem(this.renderer.getScene(), 2000);
    
  // Entities
    this.arena = new Arena(this.renderer.getScene(), this.config.arenaSize);
    this.snake = new Snake(this.renderer.getScene(), this.config);
    this.food = new Food(this.renderer.getScene(), this.config);

  // Direction getter for input manager
  this.inputManager.registerDirectionGetter(() => this.snake['direction']);

  // UI element refs
    this.scoreElement = document.getElementById('score')!;
    this.highScoreElement = document.getElementById('highScore')!;
    this.startScreenElement = document.getElementById('startScreen')!;
    this.gameOverElement = document.getElementById('gameOver')!;
    this.finalScoreElement = document.getElementById('finalScore')!;

    this.setupEventListeners();
    this.loadHighScore();
    this.showStartScreen();
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
  // Input events
    this.inputManager.on('direction_change', (direction: Direction) => {
      if (this.gameState === GameState.PLAYING) {
        this.snake.setDirection(direction);
      }
    });

    this.inputManager.on('pause', () => {
      if (this.gameState === GameState.PLAYING) {
        this.pauseGame();
      } else if (this.gameState === GameState.PAUSED) {
        this.resumeGame();
      }
    });

  // Snake events
    this.snake.on('collision', () => {
      // Create collision particle effect
      this.particles.createCollisionEffect(this.snake.getHeadPosition());
      this.gameOver();
    });

  // UI events
    const startButton = document.getElementById('startButton')!;
    const restartButton = document.getElementById('restartButton')!;

    startButton.addEventListener('click', () => this.startGame());
    restartButton.addEventListener('click', () => this.restartGame());

  // Food events
    this.food.on('food_collected', (points: number) => {
      this.score += points;
      this.updateScore();
    });
  }

  /**
   * Show start screen
   */
  private showStartScreen(): void {
    this.gameState = GameState.MENU;
    this.startScreenElement.style.display = 'block';
    this.gameOverElement.style.display = 'none';
  }

  /**
   * Start the game
   */
  private startGame(): void {
    this.gameState = GameState.PLAYING;
    this.startScreenElement.style.display = 'none';
    this.gameOverElement.style.display = 'none';
    
    this.score = 0;
    this.updateScore();
    this.resetGame();
    this.startGameLoop();
  }

  /**
   * Pause the game
   */
  private pauseGame(): void {
    this.gameState = GameState.PAUSED;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Resume the game
   */
  private resumeGame(): void {
    this.gameState = GameState.PLAYING;
    this.startGameLoop();
  }

  /**
   * Game over
   */
  private gameOver(): void {
    this.gameState = GameState.GAME_OVER;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Update high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
      this.updateHighScore();
    }

    // Show game over screen
    this.finalScoreElement.textContent = `Final Score: ${this.score}`;
    this.gameOverElement.style.display = 'block';
  }

  /**
   * Restart the game
   */
  private restartGame(): void {
    this.gameOverElement.style.display = 'none';
    this.startGame();
  }

  /**
   * Reset game entities
   */
  private resetGame(): void {
    this.snake.reset();
    this.food.reset(this.snake.getSegmentPositions());
  }

  /**
   * Start the game loop
   */
  private startGameLoop(): void {
    this.lastTime = performance.now();
    this.gameLoop();
  }

  /**
   * Main game loop
   */
  private gameLoop = (): void => {
    if (this.gameState !== GameState.PLAYING) {
      return;
    }

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  /**
   * Update game logic
   */
  private update(deltaTime: number): void {
    this.snake.update(deltaTime);
    this.food.update(deltaTime * 0.001); // Convert to seconds

    // Check food collision
    if (this.snake.checkFoodCollision(this.food.getPosition())) {
      // Create beautiful food collection particle effect
      this.particles.createFoodCollectionEffect(this.food.getPosition());
      
      this.snake.grow();
      this.score += this.food.collect();
      this.updateScore();
      this.food.reset(this.snake.getSegmentPositions());
    }

    // Update particle system
    this.particles.update(deltaTime * 0.001);

    // Update camera to follow snake head
    this.renderer.updateCamera(this.snake.getHeadPosition());
  }

  /**
   * Render the game
   */
  private render(): void {
    this.renderer.render();
  }

  /**
   * Update score display
   */
  private updateScore(): void {
    this.scoreElement.textContent = `Score: ${this.score}`;
  }

  /**
   * Update high score display
   */
  private updateHighScore(): void {
    this.highScoreElement.textContent = `High Score: ${this.highScore}`;
  }

  /**
   * Save high score to localStorage
   */
  private saveHighScore(): void {
    localStorage.setItem('snake-game-high-score', this.highScore.toString());
  }

  /**
   * Load high score from localStorage
   */
  private loadHighScore(): void {
    const saved = localStorage.getItem('snake-game-high-score');
    if (saved) {
      this.highScore = parseInt(saved, 10) || 0;
      this.updateHighScore();
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.snake?.destroy();
    this.food?.destroy();
    this.arena?.destroy();
    this.particles?.destroy();
    this.renderer?.destroy();
    this.inputManager?.destroy();
  }
}
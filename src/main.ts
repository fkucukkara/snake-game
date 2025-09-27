import { SnakeGame } from '@/game/SnakeGame';

/**
 * Main entry point for the Snake Game
 */
class GameApplication {
  private game: SnakeGame | null = null;

  /**
   * Initialize the game application
   */
  init(): void {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    
    if (!canvas) {
      console.error('Game canvas not found!');
      return;
    }

    try {
      this.game = new SnakeGame(canvas);
    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.showError('Failed to initialize the game. Please refresh and try again.');
    }

    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    document.addEventListener('visibilitychange', () => {
      if (this.game) {
        // Pause/resume logic would be implemented in SnakeGame class
      }
    });
  }

  /**
   * Show error message to user
   */
  private showError(message: string): void {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      z-index: 1000;
      text-align: center;
      font-family: Arial, sans-serif;
    `;
    errorDiv.innerHTML = `
      <h3>Error</h3>
      <p>${message}</p>
      <button onclick="window.location.reload()" style="
        background: white;
        color: red;
        border: none;
        padding: 10px 20px;
        margin-top: 10px;
        border-radius: 5px;
        cursor: pointer;
      ">Refresh Page</button>
    `;
    document.body.appendChild(errorDiv);
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.game) {
      this.game.destroy();
      this.game = null;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new GameApplication();
  app.init();
});
window.addEventListener('error', (event) => {
  console.error('Game error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
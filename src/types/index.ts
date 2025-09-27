import { Vector3, Quaternion, Mesh } from 'three';

export enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game_over'
}

export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
  FORWARD = 'forward',
  BACKWARD = 'backward'
}

export interface SnakeSegment {
  position: Vector3;
  rotation: Quaternion;
  mesh: Mesh;
}

export interface GameConfig {
  arenaSize: number;
  snakeSpeed: number;
  segmentSize: number;
  foodSize: number;
  initialSnakeLength: number;
}

export interface InputEventType {
  MOVE_UP: 'move_up';
  MOVE_DOWN: 'move_down';
  MOVE_LEFT: 'move_left';
  MOVE_RIGHT: 'move_right';
  PAUSE: 'pause';
  RESTART: 'restart';
}

export interface GameEvents {
  FOOD_EATEN: 'food_eaten';
  COLLISION: 'collision';
  SCORE_UPDATED: 'score_updated';
  GAME_OVER: 'game_over';
}

export type EventCallback = (...args: any[]) => void;
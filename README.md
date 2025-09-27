# 🐍 3D Snake Game

A modern 3D Snake game built with **TypeScript**, **Three.js**, and **Vite**. Features clean architecture, strict typing, and modular design for easy customization and extension.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat&logo=three.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Features

- **3D Graphics**: Stunning 3D rendering with Three.js WebGL
- **Modern Architecture**: Clean separation between engine and game logic
- **Type Safety**: Full TypeScript with strict mode enabled
- **Game Mechanics**: 
  - Smooth snake movement and growth
  - Wall and self-collision detection
  - Dynamic food spawning with scoring
  - Game state management (Menu, Playing, Paused, Game Over)
- **Developer Experience**: Hot module replacement, ESLint, and Prettier
- **Performance**: Optimized rendering loop with requestAnimationFrame

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Snake

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:3000`).

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## 🎮 Controls

| Key | Action |
|-----|--------|
| **WASD** or **Arrow Keys** | Move snake in 3D space |
| **Space** | Pause/Resume game |
| **Enter** | Start game from menu |
| **R** | Restart after game over |

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint on source files |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format code with Prettier |

## 📁 Project Structure

```
├── src/
│   ├── engine/              # 🎮 Game Engine Layer
│   │   ├── core/            # Core systems (events, utilities)
│   │   │   ├── EventManager.ts
│   │   │   └── index.ts
│   │   ├── graphics/        # Rendering and visual systems
│   │   │   ├── Renderer.ts  # Three.js renderer setup
│   │   │   └── index.ts
│   │   ├── input/           # Input handling systems
│   │   │   ├── InputManager.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── game/                # 🕹️ Game Logic Layer
│   │   ├── entities/        # Game objects
│   │   │   ├── Arena.ts     # 3D game arena
│   │   │   ├── Food.ts      # Food spawning logic
│   │   │   ├── Snake.ts     # Snake entity
│   │   │   └── index.ts
│   │   ├── SnakeGame.ts     # Main game controller
│   │   └── index.ts
│   ├── types/               # 📝 TypeScript definitions
│   │   └── index.ts         # Game types and interfaces
│   └── main.ts              # 🚪 Application entry point
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── README.md               # This file
```

## ⚙️ Configuration

Game settings can be customized in `src/game/SnakeGame.ts`:

```typescript
private config: GameConfig = {
  arenaSize: 20,          // Size of the game arena
  snakeSpeed: 5,          // Movement speed (moves per second)
  segmentSize: 2,         // Size of snake segments
  foodSize: 1.5,          // Size of food items
  initialSnakeLength: 3   // Starting length of snake
};
```

## 🛠️ Technologies Used

- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript with modern features
- **[Three.js](https://threejs.org/)** - 3D graphics library for WebGL
- **[Vite](https://vitejs.dev/)** - Fast build tool and development server
- **[ESLint](https://eslint.org/)** - Code linting and quality assurance
- **[Prettier](https://prettier.io/)** - Code formatting

## 🏗️ Architecture

This project follows modern game development patterns:

- **Entity-Component-System (ECS)**: Modular game objects with reusable components
- **Separation of Concerns**: Clear distinction between engine and game logic
- **Event-Driven**: Decoupled systems communicating through events
- **Type Safety**: Full TypeScript integration with strict mode

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>🎮 Happy Gaming! 🐍</strong>
  <br>
  <sub>Built with ❤️ using TypeScript and Three.js</sub>
</div>
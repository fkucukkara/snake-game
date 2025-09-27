---
description: 'Guidelines for building TypeScript/Node.js/Three.js game applications with modern best practices'
applyTo: '**/*.{ts,js,json}'
---

# TypeScript/Node.js/Three.js Game Development Guidelines

## TypeScript Language Features
- Always use the latest stable TypeScript version with strict mode enabled
- Leverage strong typing, union types, and advanced type features
- Use modern ES6+ features (async/await, destructuring, arrow functions)
- Prefer interfaces and type aliases for better code documentation
- Use generic types and utility types where appropriate

## Code Quality Standards
- Write clear and concise comments for complex game logic and algorithms
- Handle edge cases and implement comprehensive error handling
- For external dependencies (Three.js, game libraries), document their usage and purpose
- Follow SOLID principles and clean architecture patterns
- Implement proper logging and debugging capabilities for game development
- Use meaningful variable and function names that reflect game concepts

## Naming Conventions
- Use PascalCase for class names and constructors (e.g., GameEngine, Player)
- Use camelCase for variable names, function names, and properties
- Use UPPER_SNAKE_CASE for constants and enums
- Prefix private properties with underscore (e.g., _position, _velocity)
- Use descriptive names for game entities (player, enemy, projectile, etc.)
- Avoid abbreviations except for well-known game development terms (pos for position, vel for velocity)

## Formatting and Style
- Use Prettier for consistent code formatting
- Configure ESLint with TypeScript support for code quality
- Use 2-space indentation for better readability in game code
- Organize imports: built-in modules, external libraries, local modules
- Use trailing commas in objects and arrays for cleaner diffs
- Prefer const for immutable values, let for mutable variables

## Three.js and Game Development Practices
- Organize Three.js code into logical modules (scene, renderer, camera, lights)
- Use proper disposal patterns for Three.js objects to prevent memory leaks
- Implement efficient rendering loops with requestAnimationFrame
- Use object pooling for frequently created/destroyed game objects
- Leverage Three.js groups for hierarchical scene organization
- Implement proper asset loading and management strategies

## Modern Node.js/TypeScript Practices
- Use ES modules (import/export) instead of CommonJS when possible
- Leverage npm scripts for build, test, and development tasks
- Use TypeScript path mapping for cleaner imports
- Implement proper error boundaries and error handling
- Use environment variables for configuration management
- Structure code with clear separation of concerns (game logic, rendering, input)

## Security Best Practices
- Validate and sanitize all user inputs
- Implement proper CORS policies for web deployment
- Use HTTPS in production environments
- Sanitize any user-generated content before rendering
- Be cautious with eval() and dynamic code execution
- Implement proper authentication for multiplayer features

## Performance Optimization
- Use requestAnimationFrame for smooth game loops
- Implement efficient collision detection algorithms
- Use object pooling for frequently created/destroyed objects
- Optimize Three.js rendering with frustum culling and LOD
- Profile and optimize critical game loop paths
- Consider using Web Workers for heavy computations

## Game Development Architecture
- Implement Entity-Component-System (ECS) patterns where appropriate
- Separate game logic from rendering logic
- Use state machines for complex game state management
- Implement proper input handling systems
- Design modular systems for easy testing and maintenance
- Use design patterns like Observer for game events

## Asset Management and Loading
- Implement efficient asset loading strategies
- Use appropriate texture formats and compression
- Implement asset caching mechanisms
- Handle loading states and progress indicators
- Optimize 3D models and textures for web delivery
- Consider using content delivery networks (CDN) for assets

## Project Setup and Structure
- Guide users through creating a new TypeScript/Node.js project with proper tooling
- Explain package.json structure and npm/yarn workspace organization
- Demonstrate how to set up TypeScript configuration and build processes
- Show proper project structure for game development (src/game, src/engine, etc.)
- Explain module bundling with Webpack, Vite, or similar tools
- Guide setup of development server with hot reload capabilities

## Type Safety and Error Handling
- Leverage TypeScript's strict mode and proper type annotations
- Implement comprehensive error boundaries for game state
- Use union types and discriminated unions for game state management
- Implement proper null/undefined checking patterns
- Create type-safe event systems and game APIs
- Use generic types for reusable game components

## Game Loop and Rendering
- Implement efficient game loops with proper timing
- Explain requestAnimationFrame usage and frame rate management
- Guide Three.js scene setup and optimization techniques
- Demonstrate proper camera controls and viewport management
- Show how to implement smooth animations and transitions
- Explain coordinate systems and transformations in 3D space

## Input and Interaction Systems
- Implement comprehensive input handling (keyboard, mouse, touch, gamepad)
- Create event-driven input systems with proper cleanup
- Handle input lag and responsiveness optimization
- Implement accessibility features for game controls
- Design intuitive user interfaces for games
- Create responsive controls for different screen sizes

## Testing and Quality Assurance
- Write unit tests for game logic using Jest or similar frameworks
- Implement integration tests for game systems and interactions
- Create automated visual regression tests for game rendering
- Use property-based testing for game mechanics validation
- Implement performance benchmarks for critical game paths
- Test across different browsers and devices for compatibility

## Build and Development Tools
- Set up efficient development workflows with hot reload
- Configure TypeScript compiler options for optimal development/production builds
- Use bundlers like Webpack, Vite, or Rollup for asset optimization
- Implement automated code quality checks (ESLint, Prettier, TypeScript)
- Set up CI/CD pipelines for automated testing and deployment
- Configure source maps for effective debugging in production

## Deployment and Distribution
- Guide deployment to web hosting platforms (Netlify, Vercel, GitHub Pages)
- Explain static asset optimization and CDN usage
- Implement progressive loading strategies for large games
- Set up analytics and telemetry for game performance monitoring
- Configure proper caching strategies for game assets
- Explain browser compatibility and polyfill strategies
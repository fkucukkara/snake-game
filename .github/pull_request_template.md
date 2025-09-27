## Thanks for contributing to Snake Game! 🐍

Please take a moment to review the following checklist before submitting your pull request:

### Code Quality
- [ ] Code follows TypeScript best practices and project conventions
- [ ] ESLint and Prettier checks pass (`npm run lint`)
- [ ] TypeScript compilation succeeds (`npm run type-check`)
- [ ] No console.log statements in production code (use proper logging)

### Game Development
- [ ] Three.js objects are properly disposed to prevent memory leaks
- [ ] Game performance remains smooth (no frame rate drops)
- [ ] Input handling is responsive and works across devices
- [ ] Game logic is separated from rendering code
- [ ] Object pooling used for frequently created/destroyed entities

### Testing
- [ ] Unit tests added for new game logic
- [ ] Existing tests still pass (`npm test`)
- [ ] Manual testing completed across different browsers
- [ ] Performance testing done if changes affect game loop

### Documentation
- [ ] Code is properly documented with TypeScript types
- [ ] README updated if new features added
- [ ] Comments added for complex game algorithms
- [ ] API documentation updated if applicable

### Accessibility & Compatibility
- [ ] Works on mobile devices (responsive design)
- [ ] Keyboard controls are accessible
- [ ] Works across modern browsers (Chrome, Firefox, Safari, Edge)
- [ ] Performance acceptable on lower-end devices

### Security
- [ ] No sensitive information in code
- [ ] User input properly validated and sanitized
- [ ] No use of dangerous functions like eval()

---

**Description of Changes:**
<!-- Describe what this PR changes and why -->

**Type of Change:**
- [ ] Bug fix
- [ ] New feature
- [ ] Performance improvement
- [ ] Refactoring
- [ ] Documentation update

**Testing:**
<!-- Describe how you tested these changes -->

**Screenshots/GIFs:**
<!-- If applicable, add screenshots or GIFs showing the changes -->

**Related Issues:**
<!-- Link any related issues using #issue_number -->

---

By submitting this pull request, I confirm that my contribution is made under the terms of the project's license.
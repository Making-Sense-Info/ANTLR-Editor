# ANTLR Editor Tests

This directory contains comprehensive tests for the ANTLR Editor component, covering unit tests, integration tests, performance tests, accessibility tests, and regression tests.

## Test Structure

```
src/__tests__/
├── Editor.test.tsx              # Unit tests for the main Editor component
├── integration/                 # Integration tests
│   └── EditorIntegration.test.tsx
├── performance/                 # Performance tests
│   └── EditorPerformance.test.tsx
├── accessibility/               # Accessibility tests
│   └── EditorAccessibility.test.tsx
├── regression/                  # Regression tests
│   └── EditorRegression.test.tsx
├── utils/                       # Test utilities
│   └── testUtils.tsx
├── setup.ts                     # Test setup and global mocks
└── README.md                    # This file
```

## Running Tests

### All Tests

```bash
npm run test
```

### Specific Test Suites

```bash
# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# Performance tests
npm run test:performance

# Accessibility tests
npm run test:accessibility

# Regression tests
npm run test:regression
```

### Test Modes

```bash
# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## Test Categories

### 1. Unit Tests (`Editor.test.tsx`)

- Component rendering
- Props handling
- Event handling
- Error handling
- Monaco editor integration
- Keyboard shortcuts
- Script changes
- Theme and options

### 2. Integration Tests (`integration/EditorIntegration.test.tsx`)

- Complete editor workflow
- Monaco editor lifecycle
- Script changes and validation
- Rapid script changes
- Large script content
- Concurrent operations
- Error recovery
- Variables and autocomplete
- Theme changes
- Layout changes

### 3. Performance Tests (`performance/EditorPerformance.test.tsx`)

- Editor mount time
- Script update performance
- Content change performance
- Rapid content changes
- Large script content
- Layout changes
- Concurrent operations
- Memory usage
- Component unmounting
- Debounced operations
- Error recovery
- Validation performance
- Shortcuts performance

### 4. Accessibility Tests (`accessibility/EditorAccessibility.test.tsx`)

- ARIA attributes
- Keyboard navigation
- Screen reader support
- Focus management
- Error announcements
- High contrast mode
- Reduced motion preferences
- Zoom levels
- Custom footer components
- Read-only mode
- Multiple languages

### 5. Regression Tests (`regression/EditorRegression.test.tsx`)

- Monaco disposal errors
- Layout change issues
- Memory leaks
- Script change problems
- Shortcuts issues
- Theme problems
- Options handling
- Variables handling
- Footer display
- Error boundary issues
- Performance regressions

## Test Utilities

The `utils/testUtils.tsx` file provides helpful utilities for testing:

- `createMockTools()` - Create mock ANTLR tools
- `createMockMonacoEditor()` - Create mock Monaco editor
- `createMockMonaco()` - Create mock Monaco instance
- `createMockError()` - Create mock error objects
- `measurePerformance()` - Measure function execution time
- `checkAriaAttributes()` - Check ARIA attributes
- `generateLargeScript()` - Generate large script content
- `generateMockVariables()` - Generate mock variables
- `generateMockErrors()` - Generate mock validation errors

## Mocking Strategy

### Monaco Editor

The Monaco Editor is mocked to provide realistic behavior without the actual Monaco dependencies:

- Editor lifecycle events
- Content changes
- Keyboard shortcuts
- Cursor position changes
- Validation and markers

### Providers

Monaco providers are mocked to test the integration without complex setup:

- Completion providers
- Hover providers
- Language providers
- Theme providers

### Performance API

The Performance API is mocked to measure and track performance metrics:

- Timing measurements
- Memory usage
- Performance marks and measures

## Coverage

The tests aim for comprehensive coverage of:

- ✅ Component rendering and props
- ✅ Event handling and callbacks
- ✅ Error handling and recovery
- ✅ Performance and memory usage
- ✅ Accessibility features
- ✅ Integration with Monaco Editor
- ✅ Keyboard shortcuts and navigation
- ✅ Script validation and parsing
- ✅ Theme and styling
- ✅ Layout and resizing
- ✅ Memory management and cleanup

## Best Practices

1. **Isolation**: Each test is isolated and doesn't depend on others
2. **Mocking**: External dependencies are properly mocked
3. **Cleanup**: Tests clean up after themselves
4. **Performance**: Performance tests have reasonable thresholds
5. **Accessibility**: Accessibility tests check ARIA attributes and keyboard navigation
6. **Regression**: Regression tests prevent known issues from recurring

## Debugging Tests

### Running Specific Tests

```bash
# Run a specific test file
npm run test src/__tests__/Editor.test.tsx

# Run tests matching a pattern
npm run test -- --grep "Monaco disposal"

# Run tests in a specific directory
npm run test src/__tests__/integration/
```

### Debug Mode

```bash
# Run tests in debug mode
npm run test -- --reporter=verbose

# Run tests with UI for debugging
npm run test:ui
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Open coverage report
open coverage/index.html
```

## Continuous Integration

The tests are designed to run in CI environments:

- No external dependencies
- Deterministic results
- Fast execution
- Comprehensive coverage
- Clear error messages

## Contributing

When adding new tests:

1. Follow the existing naming conventions
2. Use the provided test utilities
3. Mock external dependencies
4. Test both success and error cases
5. Include performance considerations
6. Check accessibility features
7. Add regression tests for bug fixes

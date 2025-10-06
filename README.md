# ANTLR Editor

[![ANTLR Editor CI](https://github.com/Making-Sense-Info/ANTLR-Editor/actions/workflows/ci.yaml/badge.svg)](https://github.com/Making-Sense-Info/ANTLR-Editor/actions/workflows/ci.yaml)
[![NPM version](https://badge.fury.io/js/@making-sense%2Fantlr-editor.svg)](https://badge.fury.io/js/@making-sense%2Fantlr-editor)
[![Storybook](https://cdn.jsdelivr.net/gh/storybookjs/brand@main/badge/badge-storybook.svg)](https://making-sense-info.github.io/ANTLR-Editor)

A robust TypeScript editor component built on Monaco Editor with ANTLR4 integration. Features enhanced error handling, automatic resource cleanup, and stable resizing capabilities.

## ✨ Key Features

- **🔧 Robust Error Handling**: Automatically handles Monaco disposal errors without user intervention
- **🚀 Stable Resizing**: Editor maintains cursor position and selection during layout changes
- **🧹 Automatic Cleanup**: Prevents memory leaks with intelligent resource management
- **⚡ Performance Optimized**: Minimal remounts and efficient provider management
- **🎨 Monaco Integration**: Full Monaco Editor features with syntax highlighting and autocomplete
- **📝 ANTLR4 Support**: Built-in support for ANTLR4 grammars and tools

## 📦 Installation

```bash
yarn add @making-sense/antlr-editor
```

### For VTL 2.1 Support

```bash
yarn add @making-sense/antlr-editor @making-sense/vtl-2-1-antlr-tools-ts @making-sense/vtl-2-1-monaco-tools-ts
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { AntlrEditor } from "@making-sense/antlr-editor";
import * as VTLTools from "@making-sense/vtl-2-1-antlr-tools-ts";
import { getSuggestionsFromRange, monarchDefinition } from "@making-sense/vtl-2-1-monaco-tools-ts";

const customTools = { ...VTLTools, getSuggestionsFromRange, monarchDefinition };

const MyEditor = () => {
    const [script, setScript] = useState("");

    return (
        <AntlrEditor
            script={script}
            setScript={setScript}
            tools={customTools}
            height="400px"
            width="100%"
            theme="vs-dark"
            shortcuts={{
                "ctrl+s, meta+s": () => console.log("Save"),
                "ctrl+enter, meta+enter": () => console.log("Run")
            }}
            displayFooter={true}
        />
    );
};
```

### Advanced Usage with Error Handling

```typescript
import { AntlrEditor, cleanupProviders } from "@making-sense/antlr-editor";

const AdvancedEditor = () => {
    const [script, setScript] = useState("");

    // Manual cleanup for advanced scenarios
    useEffect(() => {
        return () => {
            cleanupProviders();
        };
    }, []);

    return (
        <AntlrEditor
            script={script}
            setScript={setScript}
            tools={customTools}
            height="100%"
            width="100%"
            theme="vs-dark"
            options={{
                lineNumbers: "on",
                minimap: { enabled: true },
                readOnly: false
            }}
            shortcuts={{
                "ctrl+s, meta+s": handleSave,
                "ctrl+enter, meta+enter": handleRun
            }}
            onListErrors={(errors) => {
                console.log("Validation errors:", errors);
            }}
            displayFooter={true}
        />
    );
};
```

## 📋 API Reference

### AntlrEditor Props

| Prop                 | Type                                                 | Default     | Description                                |
| -------------------- | ---------------------------------------------------- | ----------- | ------------------------------------------ |
| `script`             | `string`                                             | `''`        | The script content to display              |
| `setScript`          | `(value: string) => void`                            | -           | Callback for script changes                |
| `tools`              | `Tools`                                              | -           | **Required** - ANTLR4 tools configuration  |
| `height`             | `string`                                             | `'50vh'`    | Editor height (CSS value)                  |
| `width`              | `string`                                             | `'100%'`    | Editor width (CSS value)                   |
| `theme`              | `string`                                             | `'vs-dark'` | Monaco theme (`vs-dark`, `vs-light`, etc.) |
| `options`            | `Monaco.editor.IStandaloneEditorConstructionOptions` | `{}`        | Monaco editor options                      |
| `shortcuts`          | `Record<string, () => void>`                         | -           | Keyboard shortcuts                         |
| `FooterComponent`    | `React.FC<{ cursor: CursorType }>`                   | -           | Custom footer component                    |
| `displayFooter`      | `boolean`                                            | `true`      | Whether to show footer                     |
| `onListErrors`       | `(errors: Error[]) => void`                          | -           | Error callback                             |
| `variables`          | `Variables`                                          | `{}`        | Variables for autocomplete                 |
| `variablesInputURLs` | `string[]`                                           | `[]`        | URLs to fetch variables from               |
| `customFetcher`      | `(url: string) => Promise<any>`                      | `fetch`     | Custom fetch function                      |

### Tools Configuration

The `tools` prop requires an ANTLR4 configuration object:

```typescript
interface Tools {
    id: string; // Language identifier
    initialRule: string; // Starting rule name
    grammar: string; // Grammar definition
    Lexer: Antlr4Lexer; // ANTLR4 Lexer class
    Parser: Antlr4Parser; // ANTLR4 Parser class
    monarchDefinition?: any; // Monaco syntax highlighting
    getSuggestionsFromRange?: any; // Custom suggestions
}
```

### Variables for Autocomplete

```typescript
const variables = {
    "var1": { "type": "STRING", "role": "IDENTIFIER" },
    "var2": { "type": "INTEGER", "role": "MEASURE" },
    "var3": { "type": "NUMBER", "role": "DIMENSION" }
};
```

### Keyboard Shortcuts

```typescript
const shortcuts = {
    "ctrl+s, meta+s": () => handleSave(),
    "ctrl+enter, meta+enter": () => handleRun(),
    "ctrl+z, meta+z": () => handleUndo(),
    "ctrl+y, meta+y": () => handleRedo()
};
```

## 🛠️ Best Practices

### 1. **Container Sizing**

Always ensure the editor container has a defined height:

```typescript
// ✅ Good
<div style={{ height: "400px" }}>
    <AntlrEditor height="100%" />
</div>

// ❌ Avoid
<div>
    <AntlrEditor height="auto" />
</div>
```

### 2. **Error Handling**

The editor handles Monaco disposal errors automatically, but you can add custom error handling:

```typescript
const handleErrors = (errors) => {
    // Handle validation errors
    setValidationErrors(errors);
};

<AntlrEditor
    onListErrors={handleErrors}
    // ... other props
/>
```

### 3. **Performance Optimization**

For large scripts or frequent updates, consider debouncing:

```typescript
const [script, setScript] = useState("");
const [debouncedScript, setDebouncedScript] = useState("");

useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedScript(script);
    }, 300);

    return () => clearTimeout(timer);
}, [script]);

<AntlrEditor
    script={debouncedScript}
    setScript={setScript}
    // ... other props
/>
```

### 4. **Theme Management**

Support both light and dark themes:

```typescript
const { isDarkMode } = useTheme();

<AntlrEditor
    theme={isDarkMode ? "vs-dark" : "vs-light"}
    // ... other props
/>
```

### 5. **Custom Fetch for Authentication**

```typescript
const customFetcher = (url) => {
    return fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
};

<AntlrEditor
    customFetcher={customFetcher}
    variablesInputURLs={["https://api.example.com/variables"]}
    // ... other props
/>
```

## 🔧 Development

### Storybook

```bash
yarn storybook
```

### Test App

```bash
# Clone and setup
git clone https://github.com/Making-Sense-Info/ANTLR-Editor
cd ANTLR-Editor
yarn

# Start test app in watch mode
yarn start-test-app

# Link to external project
yarn link-in-app test-app
```

### Testing

Open `test-enhanced-editor.html` in your browser to test:

- Editor resizing without remounting
- Layout changes and stability
- Error handling and recovery
- Cursor position preservation

## 🐛 Troubleshooting

### Common Issues

1. **"InstantiationService has been disposed" errors**
    - The editor handles these automatically
    - If you still see them, ensure you're using the latest version

2. **Editor not resizing properly**
    - Make sure the container has a defined height
    - Check that the `height` prop is set correctly

3. **Memory leaks**
    - The editor includes automatic cleanup
    - For manual cleanup, use `cleanupProviders()`

4. **Cursor position lost during resize**
    - This is now handled automatically
    - The editor maintains state during layout changes

### Debug Mode

Enable debug logging:

```javascript
// In browser console
localStorage.setItem("debug", "antlr-editor:*");
```

## 🌐 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📄 License

Same as the main ANTLR Editor package.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📚 Examples

Check out the Storybook stories for comprehensive examples:

- Basic editor setup
- Resizing and layout tests
- Error handling scenarios
- Custom theming and styling

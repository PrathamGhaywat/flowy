# 🌊 Flowy - Interactive Flowchart Designer

A modern, interactive flowchart designer built with Svelte and TypeScript. Create beautiful flowcharts with drag & drop functionality, connect nodes with arrows, and export your work as images or JSON.

## Features

### ✨ Core Functionality
- **Drag & Drop Nodes**: Create flowchart nodes by dragging from the palette or clicking
- **Node Types**: Support for Process, Decision, Input, and Output nodes with unique shapes
- **Editable Text**: Double-click any node to edit its text content
- **Smart Connections**: Connect nodes with curved arrows by dragging between connection points
- **Snap to Grid**: Automatic alignment with configurable grid size
- **Selection System**: Single and multi-select nodes with visual feedback

### 🎨 Visual Features
- **Responsive Design**: Works on desktop and mobile devices
- **Smooth Animations**: Fluid transitions and hover effects
- **Color-Coded Nodes**: Different colors for each node type
- **Grid System**: Toggle-able grid with adjustable spacing
- **Zoom & Pan**: Navigate large flowcharts with mouse controls

### 💾 Export Options
- **PNG Export**: High-quality image export using html2canvas
- **JSON Export**: Save flowchart data for later editing
- **JSON Import**: Load previously saved flowcharts
- **File Management**: Clear all nodes and connections

### 🛠️ Developer Features
- **TypeScript**: Full type safety and excellent IDE support
- **Svelte Stores**: Reactive state management
- **Component Architecture**: Modular and reusable components
- **Performance Optimized**: Efficient rendering and updates

## Getting Started

### Prerequisites
- Node.js 18+ recommended (currently works with Node.js 20.18.0)
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   ```bash
   cd flowy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run check` - Run Svelte type checking

## Usage Guide

### Creating Nodes
1. **From Palette**: Drag node types from the left panel onto the canvas
2. **Quick Create**: Click a node type in the palette to create it at the center
3. **Node Types Available**:
   - 🟢 **Process**: Rectangular nodes for process steps
   - 🟡 **Decision**: Diamond-shaped nodes for decision points
   - 🔵 **Input**: Parallelogram nodes for input operations
   - 🟣 **Output**: Parallelogram nodes for output operations

### Editing Nodes
- **Move**: Click and drag nodes around the canvas
- **Edit Text**: Double-click any node to edit its text
- **Select**: Click to select nodes (Ctrl+click for multi-select)
- **Delete**: Select nodes and press Delete key

### Creating Connections
1. Hover over a node to see connection points
2. Click and drag from one connection point to another node
3. Release over the target node to create the connection
4. Double-click connections to delete them

### Canvas Controls
- **Zoom**: Use mouse wheel to zoom in/out
- **Grid**: Toggle grid display and adjust spacing
- **Reset View**: Return to default zoom and position

### Export & Import
- **Export PNG**: Save flowchart as high-resolution image
- **Export JSON**: Save flowchart data for editing later
- **Import JSON**: Load previously saved flowcharts
- **Clear All**: Remove all nodes and connections

## Project Structure

```
src/
├── lib/
│   ├── types.ts              # TypeScript interfaces
│   ├── stores.ts             # Svelte stores for state management
│   ├── utils.ts              # Utility functions
│   ├── FlowchartCanvas.svelte # Main canvas component
│   ├── FlowchartNode.svelte   # Individual node component
│   ├── NodeConnection.svelte  # Connection/arrow component
│   ├── NodePalette.svelte     # Draggable node types panel
│   └── Toolbar.svelte         # Tools and export controls
├── App.svelte                # Main application component
├── app.css                   # Global styles
└── main.ts                   # Application entry point
```

## Technology Stack

- **Frontend Framework**: Svelte 5.16+ with TypeScript
- **Build Tool**: Vite 7.0+
- **Export Libraries**: 
  - html2canvas (PNG export)
  - file-saver (file downloads)
- **Styling**: CSS with CSS custom properties

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Keyboard Shortcuts

- **Delete**: Remove selected nodes
- **Escape**: Cancel current operation
- **Enter**: Confirm text editing
- **Ctrl+Click**: Multi-select nodes

## Tips & Tricks

1. **Precise Alignment**: Enable grid snap for perfect alignment
2. **Bulk Operations**: Select multiple nodes to move them together
3. **Quick Navigation**: Use zoom controls for better overview
4. **Save Your Work**: Export to JSON regularly to save progress
5. **Performance**: For large flowcharts, consider disabling grid display

## License

This project is open source and available under the MIT License.

## Support

For questions, bug reports, or feature requests, please open an issue in the project repository.

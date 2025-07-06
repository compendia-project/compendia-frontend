# Compendia Frontend

A modern Svelte-based frontend application for automated data story generation from online article collections. This interactive web application visualizes and presents data stories with dynamic charts, clustering, and narrative generation capabilities.

## 📋 Prerequisites

- Node.js >= 18.12.0
- npm or yarn package manager

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
# Start development server
npm run dev
# or
yarn dev
```
## 📁 Project Structure
```bash
src/
├── actions/          # Svelte actions for DOM interactions
├── components/       # Reusable Svelte components
│   ├── charts/      # Chart components
│   ├── compendia/   # Main application components
│   ├── helpers/     # Helper components
│   └── widgets/     # UI widgets
├── data/            # Sample data and datasets
├── routes/          # SvelteKit routes
├── stores/          # Svelte stores for state management
├── styles/          # Global CSS styles
├── svg/             # SVG assets
└── utils/           # Utility functions
```

## 🔗 Related Projects

- [Compendia Backend](../compendia-backend/) - The backend API and data processing engine
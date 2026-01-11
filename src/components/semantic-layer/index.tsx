// ==========================================
// Semantic Layer Application - Main Entry
// ==========================================
// This is the refactored modular version of tt5.tsx
//
// File Structure:
// - types/index.ts - TypeScript interfaces and types
// - constants/mockData.ts - Mock data constants
// - components/common.tsx - Shared utility components (StatCard, StepItem, etc.)
// - components/layout.tsx - Layout components (Sidebar, Header, AIAssistantPanel)
// - views/ - Individual view components organized by module
//
// Usage:
// Import this file to use the SemanticLayerApp component
// import SemanticLayerApp from '@/components/semantic-layer';

// Export types
export * from './types';

// Export mock data constants
export * from './constants/mockData';

// Export common components
export { StatCard, StepItem, BookIcon, ScoreBar } from './components/common';

// Export layout components
export { Sidebar, Header, AIAssistantPanel } from './components/layout';

// Export main app
export { default as SemanticLayerApp } from './SemanticLayerApp';

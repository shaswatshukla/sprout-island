import { defineConfig } from 'vite';

// No React plugin needed: esbuild compiles JSX with the automatic runtime.
// Relative base so the build works under GitHub Pages' /<repo>/ path.
export default defineConfig({ base: './', esbuild: { jsx: 'automatic' } });

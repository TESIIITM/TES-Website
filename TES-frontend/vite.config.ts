import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  base: './',
  build: {
    target: 'es2022',
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        // These directives matter to server-component bundlers, not this client-only build.
        if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') defaultHandler(warning);
      },
    },
  },
});

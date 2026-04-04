import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/bin/aictx.ts'],
  format: ['esm'],
  target: 'node18',
  clean: true,
  dts: false,
  minify: true,
  splitting: true,
  sourcemap: false,
  outDir: 'dist',
})
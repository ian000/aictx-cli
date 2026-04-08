import { defineConfig } from 'tsup'
import fs from 'fs-extra'
import path from 'path'

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
  async onSuccess() {
    await fs.copy('src/templates', 'dist/templates', { overwrite: true })
  }
})
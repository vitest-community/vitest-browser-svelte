import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.js', 'src/pure.ts'],
  dts: {
    sourcemap: true,
  },
})

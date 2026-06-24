import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const svg = readFileSync(resolve(root, 'public/logo.svg'))

const sizes = [192, 512]

async function generate() {
  for (const size of sizes) {
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(resolve(root, `public/icon-${size}x${size}.png`))
    console.log(`Generated icon-${size}x${size}.png`)
  }
}

generate().catch(console.error)

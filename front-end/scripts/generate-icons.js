import sharp from 'sharp'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const publicDir = join(process.cwd(), 'public')

try {
  mkdirSync(publicDir, { recursive: true })
} catch (e) {
  // dir exists
}

const svgPath = join(publicDir, 'icon.svg')
const svgBuffer = readFileSync(svgPath)

async function generateIcons() {
  for (const size of sizes) {
    const pngPath = join(publicDir, `pwa-${size}x${size}.png`)
    
    await sharp(svgBuffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 15, g: 23, b: 42, alpha: 1 }
      })
      .png()
      .toFile(pngPath)
    
    console.log(`Generated: ${pngPath}`)
  }

  const appleTouchPath = join(publicDir, 'apple-touch-icon.png')
  await sharp(svgBuffer)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 15, g: 23, b: 42, alpha: 1 }
    })
    .png()
    .toFile(appleTouchPath)
  console.log(`Generated: ${appleTouchPath}`)

  const faviconPath = join(publicDir, 'favicon.ico')
  await sharp(svgBuffer)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 15, g: 23, b: 42, alpha: 1 }
    })
    .png()
    .toFile(join(publicDir, 'favicon-32x32.png'))
  console.log('Generated: public/favicon-32x32.png')

  console.log('\nAll icons generated successfully!')
}

generateIcons().catch(console.error)

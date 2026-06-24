import sharp from 'sharp'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const out = resolve(root, 'public/screenshots')

// Generate placeholder screenshots
async function generate() {
  // Narrow (mobile) - 1080x1920
  await sharp({
    create: {
      width: 1080,
      height: 1920,
      channels: 4,
      background: { r: 13, g: 13, b: 26, alpha: 1 }
    }
  })
    .composite([
      { input: Buffer.from(`<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
        <rect width="1080" height="1920" fill="#0d0d1a"/>
        <circle cx="540" cy="400" r="120" fill="#22c55e" opacity="0.15"/>
        <text x="540" y="600" font-family="sans-serif" font-size="64" font-weight="bold" fill="#22c55e" text-anchor="middle">Planner</text>
        <text x="540" y="680" font-family="sans-serif" font-size="28" fill="#6b6b80" text-anchor="middle">Your Personal Planner</text>
        <rect x="200" y="800" width="680" height="160" rx="20" fill="#1a1a2e" stroke="#2a2a40" stroke-width="2"/>
        <text x="280" y="870" font-family="sans-serif" font-size="26" fill="#e8e8ed" font-weight="bold">Tasks Done</text>
        <text x="280" y="930" font-family="sans-serif" font-size="48" fill="#22c55e" font-weight="bold">5/8</text>
        <rect x="200" y="1000" width="680" height="160" rx="20" fill="#1a1a2e" stroke="#2a2a40" stroke-width="2"/>
        <text x="280" y="1070" font-family="sans-serif" font-size="26" fill="#e8e8ed" font-weight="bold">Upcoming Test</text>
        <text x="280" y="1130" font-family="sans-serif" font-size="28" fill="#6b6b80">JEE Mains - 15 Jun</text>
        <rect x="200" y="1200" width="680" height="160" rx="20" fill="#1a1a2e" stroke="#2a2a40" stroke-width="2"/>
        <text x="280" y="1270" font-family="sans-serif" font-size="26" fill="#e8e8ed" font-weight="bold">Today's Revision</text>
        <text x="280" y="1330" font-family="sans-serif" font-size="28" fill="#6b6b80">2 revisions pending</text>
        <text x="540" y="1520" font-family="sans-serif" font-size="22" fill="#6b6b80" text-anchor="middle" font-style="italic">"Small steps lead to big achievements."</text>
      </svg>`), top: 0, left: 0 }
    ])
    .png()
    .toFile(resolve(out, 'dashboard.png'))
  console.log('Generated screenshot: dashboard.png')

  // Wide (desktop) - 1920x1080
  await sharp({
    create: {
      width: 1920,
      height: 1080,
      channels: 4,
      background: { r: 13, g: 13, b: 26, alpha: 1 }
    }
  })
    .composite([
      { input: Buffer.from(`<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
        <rect width="1920" height="1080" fill="#0d0d1a"/>
        <rect x="40" y="40" width="220" height="1000" rx="16" fill="#12121f" stroke="#2a2a40" stroke-width="1"/>
        <circle cx="150" cy="100" r="24" fill="#22c55e"/>
        <text x="150" y="108" font-family="sans-serif" font-size="18" fill="#fff" text-anchor="middle" font-weight="bold">P</text>
        <text x="80" y="145" font-family="sans-serif" font-size="16" fill="#e8e8ed" font-weight="bold">Planner</text>
        <text x="80" y="165" font-family="sans-serif" font-size="11" fill="#6b6b80">Your Personal Planner</text>
        <rect x="300" y="40" width="400" height="90" rx="16" fill="#1a1a2e" stroke="#2a2a40" stroke-width="1"/>
        <text x="340" y="75" font-family="sans-serif" font-size="14" fill="#6b6b80">Tasks Done</text>
        <text x="340" y="110" font-family="sans-serif" font-size="32" fill="#22c55e" font-weight="bold">5/8</text>
        <rect x="730" y="40" width="400" height="90" rx="16" fill="#1a1a2e" stroke="#2a2a40" stroke-width="1"/>
        <text x="770" y="75" font-family="sans-serif" font-size="14" fill="#6b6b80">Tests Avg</text>
        <text x="770" y="110" font-family="sans-serif" font-size="32" fill="#22c55e" font-weight="bold">82%</text>
        <rect x="1160" y="40" width="400" height="90" rx="16" fill="#1a1a2e" stroke="#2a2a40" stroke-width="1"/>
        <text x="1200" y="75" font-family="sans-serif" font-size="14" fill="#6b6b80">Materials</text>
        <text x="1200" y="110" font-family="sans-serif" font-size="32" fill="#22c55e" font-weight="bold">67%</text>
        <rect x="300" y="160" width="1260" height="200" rx="16" fill="#1a1a2e" stroke="#3b82f650" stroke-width="1"/>
        <text x="340" y="200" font-family="sans-serif" font-size="16" fill="#e8e8ed" font-weight="bold">Things to Revise Today</text>
        <rect x="340" y="220" width="1100" height="50" rx="10" fill="#24243e" stroke="#2a2a40" stroke-width="1"/>
        <text x="370" y="250" font-family="sans-serif" font-size="14" fill="#e8e8ed">Physics - Kinematics</text>
        <rect x="340" y="280" width="1100" height="50" rx="10" fill="#24243e" stroke="#2a2a40" stroke-width="1"/>
        <text x="370" y="310" font-family="sans-serif" font-size="14" fill="#e8e8ed">Chemistry - Thermodynamics</text>
        <rect x="300" y="390" width="600" height="250" rx="16" fill="#1a1a2e" stroke="#2a2a40" stroke-width="1"/>
        <text x="340" y="430" font-family="sans-serif" font-size="14" fill="#6b6b80">TASK COMPLETION</text>
        <circle cx="550" cy="520" r="50" fill="none" stroke="#22c55e" stroke-width="8" stroke-dasharray="200" stroke-dashoffset="80"/>
        <circle cx="550" cy="520" r="50" fill="none" stroke="#2a2a40" stroke-width="8"/>
        <text x="550" y="530" font-family="sans-serif" font-size="24" fill="#e8e8ed" text-anchor="middle" font-weight="bold">62%</text>
        <rect x="300" y="670" width="1260" height="180" rx="16" fill="#1a1a2e" stroke="#22c55e30" stroke-width="1"/>
        <text x="540" y="750" font-family="sans-serif" font-size="18" fill="#e8e8ed" text-anchor="middle" font-style="italic">"Success is the sum of small efforts repeated day in and day out."</text>
      </svg>`), top: 0, left: 0 }
    ])
    .png()
    .toFile(resolve(out, 'dashboard-wide.png'))
  console.log('Generated screenshot: dashboard-wide.png')
}

generate().catch(console.error)

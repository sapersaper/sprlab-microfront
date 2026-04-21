#!/usr/bin/env node

/**
 * Switches @sprlab/microfront dependency between local (link:/file:) and npm.
 *
 * Usage:
 *   node scripts/use-lib.js local   — point examples to local lib/
 *   node scripts/use-lib.js npm     — point examples to npm registry
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, resolve } from 'path'

const mode = process.argv[2]
if (!['local', 'npm'].includes(mode)) {
  console.error('Usage: node scripts/use-lib.js <local|npm>')
  process.exit(1)
}

const root = resolve(import.meta.dirname, '..')
const libPkg = JSON.parse(readFileSync(join(root, 'lib', 'package.json'), 'utf8'))
const npmVersion = `^${libPkg.version}`

const frameworkDirs = ['vue', 'react']

for (const fw of frameworkDirs) {
  const examplesDir = join(root, 'examples', fw)
  let dirs
  try {
    dirs = readdirSync(examplesDir).filter(d =>
      statSync(join(examplesDir, d)).isDirectory() && d !== 'remote3'
    )
  } catch { continue }

  for (const dir of dirs) {
    const pkgPath = join(examplesDir, dir, 'package.json')
    let pkg
    try {
      pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    } catch { continue }

    const dep = pkg.dependencies?.['@sprlab/microfront']
    if (!dep) continue

    const isNuxt2 = !!pkg.dependencies?.nuxt
    let newValue

    if (mode === 'local') {
      newValue = isNuxt2 ? 'file:../../../lib' : 'link:../../../lib'
    } else {
      newValue = npmVersion
    }

    if (dep === newValue) {
      console.log(`  ${dir}: already ${mode} (${newValue})`)
      continue
    }

    pkg.dependencies['@sprlab/microfront'] = newValue
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
    console.log(`  ${dir}: ${dep} → ${newValue}`)
  }
}

console.log(`\nSwitched to ${mode}. Run yarn install:all to apply.`)

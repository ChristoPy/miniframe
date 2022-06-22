#!/usr/bin/env node
'use strict'
const {version} = require('../package.json')
const { execFileSync } = require('child_process')
const path = require('path')

const args = [...Array.from(process.argv).slice(2)]

if (!args.length) {
  console.error('Usage: miniframe <url>')
  process.exit(1)
}

const showHelp = () => console.log(`
miniframe <url>   Open a new window with the url
-h, --help      Show this help
-v, --version   Show version`)

const showVersion = () => console.log(`miniframe v${version}`)

const lookup = {
  '-h': showHelp,
  '--help': showHelp,
  '-v': showVersion,
  '--version': showVersion
}

const command = args[0]

if (lookup[command]) {
  lookup[command]()
}
const electronArgs = [path.resolve(__dirname, '../index.js'), ...args]

execFileSync(String(require('electron')), electronArgs, { stdio: 'inherit' })

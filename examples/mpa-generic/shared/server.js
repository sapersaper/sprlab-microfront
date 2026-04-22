/**
 * Simple static HTTP server for MPA examples.
 * Usage: node shared/server.js <port> <pages-dir>
 *
 * Serves:
 *   /dist/*  → lib/dist/ files (for ES module imports)
 *   /*       → pages from <pages-dir> (maps URL paths to .html files)
 */
import http from 'http'
import fs from 'fs'
import path from 'path'

const PORT = parseInt(process.argv[2] || '4030')
const pagesDir = path.resolve(process.argv[3] || 'pages')
const libDist = path.resolve(import.meta.dirname, '..', '..', '..', 'lib', 'dist')

http.createServer((req, res) => {
  const url = req.url.split('?')[0]

  // Serve lib dist files for ES module imports
  if (url.startsWith('/dist/')) {
    const filePath = path.join(libDist, url.slice(6))
    if (fs.existsSync(filePath)) {
      res.writeHead(200, { 'Content-Type': 'application/javascript' })
      fs.createReadStream(filePath).pipe(res)
      return
    }
  }

  // Map URL to .html file
  const htmlFile = url === '/' ? 'index.html' : url.slice(1) + '.html'
  const fullPath = path.join(pagesDir, htmlFile)

  if (fs.existsSync(fullPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    fs.createReadStream(fullPath).pipe(res)
  } else {
    res.writeHead(404)
    res.end('Not found')
  }
}).listen(PORT, () => {
  console.log(`MPA remote listening on http://localhost:${PORT}`)
})

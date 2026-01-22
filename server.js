/**
 * Simple HTTP Server for Football Auction
 * Serves static files - no dependencies required!
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // Parse URL and remove query strings
  let filePath = req.url.split('?')[0];

  // Default to index.html
  if (filePath === '/') {
    filePath = '/index.html';
  }

  // Get the full path
  const fullPath = path.join(__dirname, filePath);

  // Get file extension
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  // Read and serve the file
  fs.readFile(fullPath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found - serve 404
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head><title>404 Not Found</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>404 - File Not Found</h1>
            <p>The requested file was not found: ${filePath}</p>
            <p><a href="/">Go to Presentation View</a> | <a href="/control.html">Go to Control Panel</a></p>
          </body>
          </html>
        `);
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success - serve the file
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('===========================================');
  console.log('   FOOTBALL AUCTION SERVER STARTED');
  console.log('===========================================');
  console.log('');
  console.log(`   Presentation View: http://localhost:${PORT}/`);
  console.log(`   Control Panel:     http://localhost:${PORT}/control.html`);
  console.log('');
  console.log('   Press Ctrl+C to stop the server');
  console.log('===========================================');
  console.log('');
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('\nServer stopped');
  process.exit(0);
});

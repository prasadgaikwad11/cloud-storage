const http = require('http');
const fs = require('fs');
const path = require('path');

const root = 'C:/Users/ASUS/Downloads/cloud_/frontend';
const mime = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(root, urlPath === '/' ? '/index.html' : urlPath);
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + filePath);
      return;
    }
    res.writeHead(200, {
      'Content-Type': mime[ext] || 'text/plain',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
  });
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Frontend running at http://localhost:3000');
});

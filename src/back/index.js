
const http = require('http');
const fs = require('fs');
const path = require('path');
const unity = require('./unity');

http.createServer(async (request, response) => {
    if (path.normalize(decodeURI(request.url)) !== decodeURI(request.url)) {
        response.statusCode = 403;
        response.end();
        return;
    }
  console.log('request ', request.url);

  if (request.url === '/csharp' || request.url === '/check-csharp') {
    try {
      const data = await new Promise((resolve) => {
        let data = '';
        request.on('data', d => data += d);
        request.on('end', () => resolve(data));
      });
      const result = request.url === '/check-csharp' ? await unity.check(data) : await unity.compile(data);;
      response.writeHead(200, { 'Content-Type': 'text/plain' });
      response.end(result, 'utf-8');
    }
    catch (e) {
      console.log(e);
      response.writeHead(400, { 'Content-Type': 'text/plain' });
      response.end(e.stack, 'utf-8');
      return;
    }
  }

  if (/^\/search(?:\??|$)/.test(request.url)) {
    try {
      const [_, queryString] = request.url.split('?', 2);
      var query = queryString
        ?.split('&')
        ?.map(x => x.split('=', 2))
        ?.reduce((o, [k, v]) => (o[decodeURI(k)] = decodeURI(v), o), {}) ?? {};
      const result = await unity.search(query.q);
      response.writeHead(200, { 'Content-Type': 'text/plain' });
      response.end(result, 'utf-8');
    }
    catch (e) {
      console.log(e);
      response.writeHead(400, { 'Content-Type': 'text/plain' });
      response.end(e.stack, 'utf-8');
      return;
    }
    return;
  }

  var filePath = '.' + request.url;
  if (filePath == './') {
    filePath = './index.html';
  }

  filePath = path.join('serve-root', filePath);

  var extname = String(path.extname(filePath)).toLowerCase();
  var mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
  };

  var contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, function (error, content) {
    if (error) {
      if (error.code == 'ENOENT') {
        fs.readFile('./404.html', function (error, content) {
          response.writeHead(404, { 'Content-Type': 'text/html' });
          response.end(content, 'utf-8');
        });
      }
      else {
        response.writeHead(500);
        response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
      }
    }
    else {
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });
}).listen(8125);

console.log('Server running at http://127.0.0.1:8125/');

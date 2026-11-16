const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4321;
const CODE_HTML = path.resolve(__dirname, 'src_inputs', 'code.html');
const OUT_DIR = path.resolve(__dirname, 'outputs');

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/' || url === '/index.html') {
    fs.readFile(CODE_HTML, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading website prototype: ' + err.message);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  if (url === '/spec.pdf' || url === '/specification.pdf') {
    const pdfPath = path.join(OUT_DIR, 'RIVORA_Website_Development_Specification.pdf');
    fs.readFile(pdfPath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Specification PDF not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/pdf' });
      res.end(data);
    });
    return;
  }

  if (url === '/spec.docx') {
    const docxPath = path.join(OUT_DIR, 'RIVORA_Website_Development_Specification.docx');
    fs.readFile(docxPath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Specification DOCX not found');
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="RIVORA_Website_Development_Specification.docx"'
      });
      res.end(data);
    });
    return;
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`RIVORA preview server running at http://localhost:${PORT}/`);
});


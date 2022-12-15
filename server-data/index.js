const http = require('http');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 1129;

const options = {
};

const httpServer = http.createServer(options, app);
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log("Server listening on port: " + PORT + ` | http://localhost:${PORT}`);
});

// static resources should just be served as they are
app.use(express.static(
  path.resolve(__dirname, '..', 'uploads'),
  { maxAge: '30d' },
));
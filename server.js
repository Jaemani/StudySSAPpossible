require('dotenv').config();
const express = require('express');
const path = require('path');
// const fs = require('fs');
// const https = require('https');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Load SSL certificate
// const privateKey = fs.readFileSync('/etc/letsencrypt/live/studyssappossible.kro.kr/privkey.pem', 'utf8');
// const certificate = fs.readFileSync('/etc/letsencrypt/live/studyssappossible.kro.kr/cert.pem', 'utf8');
// const ca = fs.readFileSync('/etc/letsencrypt/live/studyssappossible.kro.kr/chain.pem', 'utf8');

// const credentials = {
//   key: privateKey,
//   cert: certificate,
//   ca: ca
// };

const http = require('http');

// const httpApp = express();
// httpApp.use((req, res) => {
//   res.redirect(301, `https://${req.headers.host}${req.url}`);
// });

// const httpPort = 3000; // Default HTTP port
// httpApp.listen(httpPort, () => {
//   console.log(`HTTP server running at http://localhost:${httpPort}, redirecting to HTTPS`);
// });

app.use(cors());

app.use(express.static('public'));
app.use(express.json());

const helmet = require('helmet');
app.use(helmet());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
  
app.use('/api/', apiLimiter);

let checkboxStates = {
  monday: [true, false, false],
  tuesday: [true, false, false],
  wednesday: [true, false, false],
  thursday: [true, false, false],
  friday: [true, false, false],
  saturday: [true, false, false],
  sunday: [true, false, false]
};

let messages = [];

const { body, validationResult } = require('express-validator');

const morgan = require('morgan');
app.use(morgan('combined'));

app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.post('/api/messages', (req, res) => {
  const { text } = req.body;
  if (text) {
    const newMessage = { id: Date.now(), text };
    messages.push(newMessage);
    res.status(201).json(newMessage);
  } else {
    res.status(400).json({ error: 'Text is required' });
  }
});

app.delete('/api/messages/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = messages.findIndex(message => message.id === id);
  if (index !== -1) {
    messages.splice(index, 1);
    res.sendStatus(204);
  } else {
    res.status(404).json({ error: 'Message not found' });
  }
});

app.get('/api/checkboxes', (req, res) => {
  res.json(checkboxStates);
});

app.post('/api/checkboxes', (req, res) => {
  checkboxStates = req.body;
  res.sendStatus(200);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
  
  // const httpsServer = https.createServer(credentials, app);

  // httpsServer.listen(port, () => {
  //   console.log(`Server running at https://localhost:${port}`);
  // });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
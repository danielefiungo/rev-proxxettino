const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config({ path: './env.config' });
const ProxyMiddleware = require('http-proxy-middleware');
const winston = require('winston');

const app = express();

app.use(
  cors(/*{
  origin: ["http://localhost:3001"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}*/)
);

const staticProxyMiddleware = ProxyMiddleware('/src/**', {
  target: process.env.FE_SERVICES_UPSTREAM,
  // control logging
  logLevel: 'debug',

  // use a different lib for logging;
  // i.e., write logs to file or server
  logProvider: function(provider) {
    return winston;
  },
  onError(err, req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/html',
    });
    res.end(err.message);
  },
});

app.use(staticProxyMiddleware);

const apiProxyMiddleware = ProxyMiddleware('!(/src)/**', {
  target: process.env.BE_SERVICES_UPSTREAM,
  // control logging
  logLevel: 'debug',

  // use a different lib for logging;
  // i.e., write logs to file or server
  logProvider: function(provider) {
    return winston;
  },
  onError(err, req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/html',
    });
    res.end(err.message);
  },
});

app.use(apiProxyMiddleware);
app.use(morgan('common'));
app.listen(process.env.PORT || 3000, function() {
  console.log(
    `\nPre Auth Proxy Debugger is running on:
    \nhttp://localhost:${process.env.PORT || 3000}${
      process.env.HELP_CONTEXT_PATH
    } \n\t\tV\n\t is proxying\n\t\tV\n${process.env.TARGET}${
      process.env.HELP_CONTEXT_PATH
    }`
  );
});

module.exports = app;

/**
 * HAZARDLINK — Enhanced Express Backend Server
 * Full-featured version with additional endpoints
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Import from main server
const mainServer = require('./server');

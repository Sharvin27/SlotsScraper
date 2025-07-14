require('dotenv').config();

const startSlotMonitor = require('./runCheckVisaSlots');
const startServer = require('./server');

startServer();
startSlotMonitor();

// --- Self-ping logic to keep Render server awake ---
function pingSelf() {
    const min = 5 * 60 * 1000; // 5 minutes in ms
    const max = 10 * 60 * 1000; // 10 minutes in ms
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;

    // Hardcoded Render URL
    const url = 'https://visaslotsbot.onrender.com';

    require('https').get(url, res => {
        console.log(`Pinged self: ${url} - Status: ${res.statusCode}`);
    }).on('error', err => {
        console.error('Ping error:', err.message);
    });

    setTimeout(pingSelf, delay);
}

// Start pinging after the server starts
pingSelf();

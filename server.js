const express = require('express');
const app = express();

app.get('/', (_, res) => res.send('✅ WhatsApp bot is running!'));

function startServer() {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🟢 Express server running on port ${PORT}`);
    });
}

module.exports = startServer;

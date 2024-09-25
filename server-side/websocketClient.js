// server-side/websocketClient.js
const WebSocket = require('ws');

// WebSocket URL from environment variables or default
const wsUrl = process.env.WS_URL || 'wss://challenge.sedilink.co.za:3006';

// Number of retry attempts for connection failures
const maxRetries = 3;

// Function to connect to the WebSocket server, send a message, and verify the reversed response
function connectWebSocket(message = 'HelloSedibelo', attempt = 1) {
  // Create a new WebSocket client
  const ws = new WebSocket(wsUrl);

  // Event listener for successful connection
  ws.on('open', () => {
    console.log('Connected to WebSocket server');

    // Send the original message to the server
    console.log(`Sending message: ${message}`);
    ws.send(message);
  });

  // Event listener for receiving messages from the server
  ws.on('message', (reversedMessage) => {
    console.log(`Received reversed message: ${reversedMessage}`);

    // Reverse the original message locally
    const expectedReversedMessage = message.split('').reverse().join('');

    // Verify if the returned message matches the reversed version of the sent message
    if (reversedMessage === expectedReversedMessage) {
      console.log('Verification successful: The received message matches the reversed version.');
    } else {
      console.error('Verification failed: The received message does not match the reversed version.');
    }

    // Close the WebSocket connection
    ws.close();
  });

  // Event listener for connection errors
  ws.on('error', (error) => {
    console.error(`WebSocket error: ${error.message}`);

    // Attempt reconnection if below maxRetries
    if (attempt < maxRetries) {
      console.log(`Attempting reconnection (${attempt + 1}/${maxRetries})...`);
      connectWebSocket(message, attempt + 1);
    } else {
      console.error('Max reconnection attempts reached. Exiting.');
    }
  });

  // Event listener for WebSocket closure
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
}

// Get the message from command line arguments or use the default message
const message = process.argv[2] || 'HelloSedibelo';

// Connect to the WebSocket server
connectWebSocket(message);

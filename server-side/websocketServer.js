// server-side/websocketServer.js
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

// Create a new WebSocket server on port 3006
const io = new Server(3006, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send transformed data from pieChart.json
  const data = getPieChartData();
  if (data) {
    socket.emit('data-update', transformDataForPieChart(data));
  }

  // Send data updates every 5 seconds with the latest transformed data from pieChart.json
  setInterval(() => {
    const updatedData = getPieChartData();
    if (updatedData) {
      socket.emit('data-update', transformDataForPieChart(updatedData));
    }
  }, 5000);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Function to read pie chart data from pieChart.json
function getPieChartData() {
  try {
    const filePath = path.join(__dirname, '../client-side/src/components/pieChart.json'); // Adjust the path if necessary
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading pieChart.json:', error.message);
    return null;
  }
}

// Function to transform data into a pie chart format
function transformDataForPieChart(data) {
  return data.map((item) => ({
    name: item.year,
    value: item.numInstalls,
  }));
}

console.log('WebSocket server is running on ws://localhost:3006');

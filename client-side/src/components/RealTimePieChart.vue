<!-- src/components/RealTimePieChart.vue -->
<template>
    <q-page class="q-pa-md">
      <q-card>
        <q-card-section>
          <div ref="chart" style="width: 100%; height: 400px;"></div>
        </q-card-section>
      </q-card>
    </q-page>
  </template>
  
  <script>
  import * as echarts from 'echarts';
  import { io } from 'socket.io-client';
  
  export default {
    name: 'RealTimePieChart',
    data() {
      return {
        chart: null,
        socket: null,
        chartData: [],
      };
    },
    methods: {
      // Initialize the chart
      initChart() {
        this.chart = echarts.init(this.$refs.chart);
        this.updateChart();
      },
      // Update the chart with the latest data
      updateChart() {
        const option = {
          title: {
            text: 'Real-Time Pie Chart',
            left: 'center',
          },
          tooltip: {
            trigger: 'item',
          },
          series: [
            {
              name: 'Data',
              type: 'pie',
              radius: '50%',
              data: this.chartData,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
            },
          ],
        };
        this.chart.setOption(option);
      },
      // Fetch initial data and set up WebSocket connection
      fetchData() {
        // Initialize WebSocket connection
        this.socket = io('ws://localhost:3006'); // Replace with your actual WebSocket server URL
  
        // Handle incoming WebSocket messages
        this.socket.on('data-update', (data) => {
          this.chartData = data; // Update chart data with the new data received
          this.updateChart();
        });
  
        // Simulate initial data fetch from pieChart.json
        fetch('/pieChart.json') 
          .then((response) => response.json())
          .then((data) => {
            this.chartData = data;
            this.updateChart();
          });
      },
    },
    mounted() {
      this.initChart();
      this.fetchData();
    },
    beforeUnmount() {
      if (this.chart) {
        this.chart.dispose();
      }
      if (this.socket) {
        this.socket.close();
      }
    },
  };
  </script>
  
  <style scoped>
  .chart-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
  </style>
  
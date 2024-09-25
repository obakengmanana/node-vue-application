<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="header-bg">
      <q-toolbar class="q-pa-sm">
        <q-btn flat round dense icon="menu" aria-label="Menu" class="q-mr-sm" />

        <q-toolbar-title class="text-white">
          <q-icon name="dashboard" class="q-mr-sm" /> Data Visualization and Management
        </q-toolbar-title>

  
        <q-space />
        <q-btn
          flat
          dense
          round
          icon="settings"
          aria-label="Settings"
          class="text-white"
          @click="openSettings"
        />
        <q-btn
          flat
          dense
          round
          icon="help_outline"
          aria-label="Help"
          class="text-white"
          @click="openHelp"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <div class="q-gutter-md q-pa-md">
        <div class="row">
          <div class="col-12 col-md-6">
            <q-card class="q-pa-md">
              <q-card-section>
                <h4 class="text-primary">Real-Time Pie Chart</h4>
              </q-card-section>
              <q-card-section>
                <RealTimePieChart />
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-6">
            <q-card class="q-pa-md">
              <q-card-section>
                <h4 class="text-primary">Employee Data Table</h4>
              </q-card-section>
              <q-card-section>
                <DynamicDataTable />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import RealTimePieChart from './components/RealTimePieChart.vue';
import DynamicDataTable from './components/DynamicDataTable.vue';

export default {
  components: {
    RealTimePieChart,
    DynamicDataTable,
  },
  methods: {
    openSettings() {
      // Placeholder function for settings button
      alert('Settings clicked!');
    },
    openHelp() {
      // Placeholder function for help button
      alert('Help clicked!');
    },
  },
};
</script>

<style scoped>
.q-layout {
  height: 100vh;
}

/* Header Background and Style Enhancements */
.header-bg {
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.q-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.q-card-section {
  padding: 10px 20px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.col-12 {
  flex: 0 0 100%;
}

.col-md-6 {
  flex: 0 0 48%;
}
</style>

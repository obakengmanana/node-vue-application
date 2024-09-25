<template>
    <div class="q-pa-md">
      <q-card class="bg-primary text-white shadow-4">
        <q-card-section class="text-h5">Employee Data</q-card-section>
        <q-card-section>
          <div class="q-mb-md">
            <q-input
              v-model="searchTerm"
              label="Search"
              outlined
              dense
              debounce="300"
              @input="applyFilters"
              class="q-mb-sm"
              filled
              color="white"
            />
            <q-select
              v-model="selectedDesignation"
              :options="designations"
              label="Filter by Designation"
              outlined
              dense
              filled
              color="white"
              @input="applyFilters"
            />
          </div>
  
          <q-table
            :rows="paginatedRows"
            :columns="columns"
            row-key="id"
            flat
            bordered
            dense
            class="q-pa-sm q-my-sm bg-white text-primary"
          >
            <template v-slot:top>
              <q-pagination
                v-model="pagination.page"
                :max="totalPages"
                boundary-numbers
                class="q-my-md"
                color="primary"
                @update:model-value="applyPagination"
              />
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </template>
  
  <script>
  import { ref, computed, watch } from 'vue';
  import {
    Notify,
    QCard,
    QCardSection,
    QInput,
    QSelect,
    QTable,
    QPagination,
  } from 'quasar';
  
  export default {
    name: 'DynamicDataTable',
    components: {
      QCard,
      QCardSection,
      QInput,
      QSelect,
      QTable,
      QPagination,
    },
    setup() {
      const rows = ref([]); // All data rows
      const searchTerm = ref(''); // Search input value
      const selectedDesignation = ref(null); // Selected designation filter value
      const filteredRows = ref([]); // Filtered rows to display
      const columns = ref([
        { name: 'name', label: 'Name', align: 'left', field: 'name' },
        { name: 'surname', label: 'Surname', align: 'left', field: 'surname' },
        { name: 'designation', label: 'Designation', align: 'left', field: 'designation' },
        { name: 'department', label: 'Department', align: 'left', field: 'department' },
      ]);
      const designations = ref([]); // List of unique designations for filtering
      const pagination = ref({
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0,
      });
  
      // Fetch data from the server
      const fetchData = async () => {
        try {
          const response = await fetch('http://localhost:3000/users.json');
          if (!response.ok) {
            throw new Error('Network response was not ok.');
          }
          const data = await response.json();
          rows.value = data;
          designations.value = [...new Set(data.map((user) => user.designation))];
          applyFilters();
        } catch (error) {
          Notify.create({
            type: 'negative',
            message: 'Failed to fetch data',
          });
        }
      };
  
      // Apply filters based on search term and selected designation
      const applyFilters = () => {
        // Reset pagination to first page when filters are applied
        pagination.value.page = 1;
  
        // Filter rows based on search term and selected designation
        filteredRows.value = rows.value.filter((row) => {
          const matchesSearchTerm = `${row.name} ${row.surname} ${row.department} ${row.designation}`
            .toLowerCase()
            .includes(searchTerm.value.toLowerCase());
          const matchesDesignation =
            !selectedDesignation.value || row.designation === selectedDesignation.value;
          return matchesSearchTerm && matchesDesignation;
        });
  
        pagination.value.rowsNumber = filteredRows.value.length; // Update pagination count
      };
  
      // Compute the total number of pages based on the number of filtered rows and rows per page
      const totalPages = computed(() => {
        return Math.ceil(pagination.value.rowsNumber / pagination.value.rowsPerPage);
      });
  
      // Paginate the filtered rows based on the current page
      const paginatedRows = computed(() => {
        const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
        const end = start + pagination.value.rowsPerPage;
        return filteredRows.value.slice(start, end);
      });
  
      // Watch for changes in search term, designation, and pagination to update filters and pagination
      watch([searchTerm, selectedDesignation, pagination], () => {
        applyFilters();
      });
  
      fetchData(); // Initial fetch of data
  
      return {
        rows,
        filteredRows,
        paginatedRows,
        columns,
        searchTerm,
        selectedDesignation,
        designations,
        pagination,
        totalPages,
        applyFilters,
      };
    },
  };
  </script>
  
  <style scoped>
  .q-card {
    background: linear-gradient(to right, #1d976c, #93f9b9);
    color: white;
  }
  
  .q-input,
  .q-select {
    margin-bottom: 1em;
    color: black;
  }
  
  .q-table {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }
  
  .q-pagination {
    margin-top: 10px;
    display: flex;
    justify-content: center;
  }
  </style>
  
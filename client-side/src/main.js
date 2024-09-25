// src/main.js
import { createApp } from 'vue';
import { Quasar, Notify } from 'quasar'; 
import quasarIconSet from 'quasar/icon-set/svg-material-icons'; 
import quasarLang from 'quasar/lang/en-US'; 

// Import Quasar and your CSS
import 'quasar/src/css/index.sass'; 
import App from './App.vue';

const app = createApp(App);

app.use(Quasar, {
  plugins: {
    Notify, // Ensure Notify plugin is registered here
  },
  config: {
    notify: {}, // Configure Notify plugin if necessary
  },
  iconSet: quasarIconSet,
  lang: quasarLang,
});

app.mount('#app');

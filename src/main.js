import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Importa o Ionic Vue
import { IonicVue } from '@ionic/vue';

// Importa o CSS do Ionic
import '@ionic/core/css/ionic.bundle.css';

// Cria a instância do Vue
const app = createApp(App);

// Usa o Ionic Vue
app.use(IonicVue);
app.use(router);

// Monta o aplicativo
app.mount('#app');

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Importa o Ionic Vue
import { IonicVue } from '@ionic/vue';

// Importa o CSS do Ionic
import '@ionic/core/css/ionic.bundle.css';

// Importa o Composable para gerenciar o tema
import { useTheme } from './composables/useTheme';

// Cria a instância do Vue
const app = createApp(App);

// Usa o Ionic Vue
app.use(IonicVue);
app.use(router);

// Gerenciar o tema globalmente
const { isDarkMode, toggleTheme } = useTheme();
app.provide('isDarkMode', isDarkMode);
app.provide('toggleTheme', toggleTheme);

// Monta o aplicativo
app.mount('#app');

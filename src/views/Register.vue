<!-- src/views/Register.vue -->
<template>
  <div class="register-container">
    <div class="register-card">
      <h2 class="register-title">Registrar</h2>
      <form @submit.prevent="register" class="register-form">
        <input
          v-model="name"
          type="text"
          placeholder="Nome"
          class="register-input"
          required
        />
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="register-input"
          required
        />
        <input
          v-model="password"
          type="password"
          placeholder="Senha"
          class="register-input"
          required
        />
        <select v-model="role" class="register-select">
          <option value="student">Aluno</option>
          <option value="teacher">Professor</option>
        </select>
        <button type="submit" class="register-button">Registrar</button>
      </form>
      <div class="login-link">
        <p>Já tem uma conta?</p>
        <router-link to="/login" class="login-button">Faça login</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default {
  data() {
    return {
      name: '',
      email: '',
      password: '',
      role: 'student',
    };
  },
  methods: {
    async register() {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          this.email,
          this.password
        );
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: this.name,
          email: this.email,
          role: this.role,
        });
        this.$router.push('/login');
      } catch (error) {
        console.error('Erro ao registrar:', error);
        // Opcional: Exibir uma mensagem de erro para o usuário
      }
    },
  },
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
  font-family: 'Arial', sans-serif;  
}

.register-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 360px;
  text-align: center;
}

.register-title {
  font-size: 2.5em;
  margin-bottom: 20px;
  color: #333;
  font-weight: bold;
}

.register-form {
  display: flex;
  flex-direction: column;
}

.register-input,
.register-select {
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s;
}

.register-input:focus,
.register-select:focus {
  border-color: #007bff;
  outline: none;
}

.register-button {
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s;
}

.register-button:hover {
  background-color: #0056b3;
}

.login-link {
  margin-top: 20px;
}

.login-link p {
  margin: 0;
  font-size: 1em;
  color: #666;
}

.login-button {
  color: #007bff;
  text-decoration: none;
  font-size: 1em;
  font-weight: bold;
  transition: color 0.3s;
}

.login-button:hover {
  color: #0056b3;
  text-decoration: underline;
}
</style>

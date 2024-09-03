<!-- src/views/Register.vue -->
<template>
  <div class="register-container">
    <div class="register-card">
      <h2 class="register-title">Registrar <ion-icon name="person-add-outline"></ion-icon></h2>
      <form @submit.prevent="register" class="register-form">
        <div class="input-group">
          <ion-icon name="person-outline" class="input-icon"></ion-icon>
          <input v-model="name" type="text" placeholder="Nome" class="register-input" required />
        </div>
        <div class="input-group">
          <ion-icon name="mail-outline" class="input-icon"></ion-icon>
          <input v-model="email" type="email" placeholder="Email" class="register-input" required />
        </div>
        <div class="input-group">
          <ion-icon name="lock-closed-outline" class="input-icon"></ion-icon>
          <input v-model="password" type="password" placeholder="Senha" class="register-input" required />
        </div>
        <div class="select-group">
          <ion-icon name="school-outline" class="select-icon"></ion-icon>
          <select v-model="role" class="register-select">
            <option value="student">Aluno</option>
            <option value="teacher">Professor</option>
          </select>
        </div>
        <button type="submit" class="register-button">Registrar <ion-icon name="checkmark-outline"></ion-icon></button>
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
import { defineComponent } from 'vue';

export default defineComponent({
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
        if (this.role === 'teacher' && !this.email.endsWith('@professor.ce.gov.br')) {
          alert('Somente emails institucionais podem ser usados para cadastrar-se como professor.');
          return;
        }

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

});
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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

.input-group,
.select-group {
  position: relative;
  margin-bottom: 15px;
}

.input-icon,
.select-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2em;
  color: #aaa;
}

.register-input,
.register-select {
  padding: 12px 12px 12px 40px;
  /* Add left padding for icon */
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s;
  width: 100%;
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

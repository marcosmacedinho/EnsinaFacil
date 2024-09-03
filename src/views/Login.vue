<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">Login <ion-icon name="log-in-outline"></ion-icon></h2>
      <form @submit.prevent="login" class="login-form">
        <div class="input-group">
          <ion-icon name="mail-outline" class="input-icon"></ion-icon>
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="login-input"
            required
          />
        </div>
        <div class="input-group">
          <ion-icon name="lock-closed-outline" class="input-icon"></ion-icon>
          <input
            v-model="password"
            type="password"
            placeholder="Senha"
            class="login-input"
            required
          />
        </div>
        <button type="submit" class="login-button">
           Partiu
           <ion-icon name="enter-outline"></ion-icon>
        </button>
      </form>
      <div class="register-link">
        <p>Não tem uma conta?</p>
        <router-link to="/register" class="register-button">Cadastre-se</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    async login() {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          this.email,
          this.password
        );
        const userDocRef = doc(db, "users", userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userRole = userDoc.data().role;

          if (userRole === "teacher") {
            this.$router.push("/teacher-dashboard");
          } else {
            this.$router.push("/student-dashboard");
          }
        } else {
          console.error("Documento do usuário não encontrado no Firestore.");
          // Opcional: Exibir uma mensagem de erro para o usuário
        }
      } catch (error) {
        console.error("Erro ao fazer login:", error);
        // Opcional: Exibir uma mensagem de erro para o usuário
      }
    },
  },
});
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
  font-family: 'Arial', sans-serif;  
}

.login-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 360px;
  text-align: center;
}

.login-title {
  font-size: 2.5em;
  margin-bottom: 20px;
  color: #333;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.input-group {
  position: relative;
  margin-bottom: 15px;
}

.input-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2em;
  color: #aaa;
}

.login-input {
  padding: 12px 12px 12px 40px; /* Add left padding for icon */
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s;
  width: 100%;
}

.login-input:focus {
  border-color: #007bff;
  outline: none;
}

.login-button {
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.login-button:hover {
  background-color: #0056b3;
}

.register-link {
  margin-top: 20px;
}

.register-link p {
  margin: 0;
  font-size: 1em;
  color: #666;
}

.register-button {
  color: #007bff;
  text-decoration: none;
  font-size: 1em;
  font-weight: bold;
  transition: color 0.3s;
}

.register-button:hover {
  color: #0056b3;
  text-decoration: underline;
}
</style>

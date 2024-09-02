<template>
  <div class="student-dashboard">
    <!-- Cabeçalho -->
    <header class="dashboard-header">
      <h2>Bem-vindo, Aluno!</h2>
    </header>

    <!-- Conteúdo Principal -->
    <div class="dashboard-content">
      <!-- Materiais Didáticos -->
      <section class="section materials">
        <h3>Materiais Didáticos</h3>
        <ul class="resource-list">
          <li v-for="material in materials" :key="material.id" class="resource-item">
            <div class="resource-info">
              <strong>{{ material.title }}</strong>
              <p>{{ material.description }}</p>
            </div>
            <a @click="recordAccess(material)" :href="material.url" target="_blank" class="btn btn-primary">
              Acessar
            </a>
          </li>
        </ul>
      </section>

      <!-- Links de Videoaulas -->
      <section class="section videos">
        <h3>Links de Videoaulas</h3>
        <ul class="resource-list">
          <li v-for="video in videos" :key="video.id" class="resource-item">
            <div class="resource-info">
              <strong>{{ video.title }}</strong>
              <p>{{ video.description }}</p>
            </div>
            <a @click="recordAccess(video)" :href="video.url" target="_blank" class="btn btn-primary">
              Assistir
            </a>
          </li>
        </ul>
      </section>

      <!-- Frequência Diária -->
      <section class="section attendance">
        <h3>Frequência Diária</h3>
        <ul class="attendance-list">
          <li v-for="entry in attendance" :key="entry.id" class="attendance-item">
            <strong>{{ entry.date }}</strong> - {{ entry.time }}
          </li>
        </ul>
      </section>
    </div>

    <!-- Mensagem de Erro -->
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import {
  onSnapshot,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../firebase"; // ajuste o caminho conforme necessário

export default {
  setup() {
    const materials = ref([]);
    const videos = ref([]);
    const attendance = ref([]);
    const error = ref(null);
    let resourcesUnsubscribe = null;
    let attendanceUnsubscribe = null;

    const fetchResources = () => {
      try {
        resourcesUnsubscribe = onSnapshot(
          collection(db, "resources"),
          (snapshot) => {
            const fetchedMaterials = [];
            const fetchedVideos = [];

            snapshot.docs.forEach((doc) => {
              const data = doc.data();
              if (data.type === "file") {
                fetchedMaterials.push({ id: doc.id, ...data });
              } else if (data.type === "link") {
                fetchedVideos.push({ id: doc.id, ...data });
              }
            });

            materials.value = fetchedMaterials;
            videos.value = fetchedVideos;
          }
        );
      } catch (err) {
        error.value =
          "Erro ao carregar os recursos. Tente novamente mais tarde.";
        console.error(err);
      }
    };

    const fetchAttendance = () => {
      try {
        attendanceUnsubscribe = onSnapshot(
          collection(db, "attendance"),
          (snapshot) => {
            attendance.value = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
          }
        );
      } catch (err) {
        error.value =
          "Erro ao carregar a frequência. Tente novamente mais tarde.";
        console.error(err);
      }
    };

    const recordAccess = async (resource) => {
  try {
    if (auth.currentUser) {
      const userEmail = auth.currentUser.email;
      console.log("User email:", userEmail); // Log do email do usuário

      // Busque o usuário no Firestore usando o email
      const userQuery = query(
        collection(db, "users"),
        where("email", "==", userEmail)
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        console.log("User data retrieved:", userData); // Log dos dados do usuário

        // Registre o acesso no Firestore
        await addDoc(collection(db, "access_logs"), {
          resourceId: resource.id,
          resourceTitle: resource.title,
          accessedBy: userData.name || "Desconhecido",
          accessedAt: new Date(),
        });
      } else {
        console.warn("User not found in Firestore");
      }
    } else {
      console.error("No user is currently authenticated.");
    }
  } catch (err) {
    console.error("Error recording access:", err);
  }
};




    onMounted(() => {
      fetchResources();
      fetchAttendance();
    });

    onUnmounted(() => {
      if (resourcesUnsubscribe) resourcesUnsubscribe();
      if (attendanceUnsubscribe) attendanceUnsubscribe();
    });

    return {
      materials,
      videos,
      attendance,
      error,
      recordAccess,
    };
  },
};
</script>

<style scoped>
.student-dashboard {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #f9f9f9;
  min-height: 100vh;
  font-family: "Arial", sans-serif;
}

.dashboard-header {
  background: #007bff;
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.section h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 1.2rem;
}

.resource-list,
.attendance-list {
  list-style: none;
  padding: 0;
}

.resource-item,
.attendance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
}

.resource-info {
  flex: 1;
}

.btn {
  background: #007bff;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
  transition: background 0.3s ease;
}

.btn-primary {
  background: #007bff;
}

.btn-primary:hover {
  background: #0056b3;
}

.attendance-item {
  color: #666;
}

.error-message {
  color: #dc3545;
  margin-top: 20px;
  font-weight: bold;
}
</style>

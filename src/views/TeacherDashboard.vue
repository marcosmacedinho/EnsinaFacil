<template>
  <div class="teacher-dashboard">
    <h2>Bem-vindo, Professor!</h2>

    <!-- Caixa de Envio de Recursos -->
    <div class="box">
      <h3>{{ isEditing ? 'Editar Recurso' : 'Enviar Recurso' }}</h3>
      <form @submit.prevent="handleSubmit" class="upload-form">
        <input v-model="title" type="text" placeholder="Título" required class="input-field" />
        <textarea v-model="description" placeholder="Descrição" required class="input-field textarea"></textarea>

        <div class="resource-type">
          <label>
            <input type="radio" value="file" v-model="resourceType" /> Arquivo
          </label>
          <label>
            <input type="radio" value="link" v-model="resourceType" /> Link
          </label>
        </div>

        <div v-if="resourceType === 'file'" class="file-upload">
          <input type="file" @change="handleFileUpload" class="file-input" />
        </div>
        <div v-else>
          <input v-model="link" type="url" placeholder="URL do Link" class="input-field" />
        </div>

        <button type="submit" class="submit-button">{{ isEditing ? 'Atualizar' : 'Enviar' }}</button>
      </form>

      <!-- Mensagem de status -->
      <div v-if="statusMessage" class="status-message">{{ statusMessage }}</div>
    </div>

    <!-- Caixa de Recursos Enviados -->
    <div class="box">
      <h3>Recursos Enviados</h3>
      <ul class="resource-list">
        <li v-for="resource in resources" :key="resource.id" class="resource-item">
          <strong>{{ resource.title }}</strong> - {{ resource.description }}
          <a :href="resource.url" target="_blank" class="resource-link">Acessar</a>
          <div class="dropdown">
            <button class="dropdown-btn">⋮</button>
            <div class="dropdown-content">
              <a @click="editResource(resource)">Editar</a>
              <a @click="deleteResource(resource.id)">Excluir</a>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Caixa de Monitoramento de Acessos -->
    <div class="box">
      <h3>Monitoramento de Acessos</h3>
      <table class="access-table">
        <thead>
          <tr>
            <th>Aluno</th>
            <th>Recurso</th>
            <th>Data e Hora</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="access in accesses" :key="access.id">
            <td>{{ access.accessedBy }}</td>
            <td>{{ access.resourceTitle }}</td>
            <td>{{ formatDate(access.accessedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { collection, addDoc, getDocs, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export default {
  setup() {
    const title = ref('');
    const description = ref('');
    const resourceType = ref('file');
    const link = ref('');
    const file = ref(null);
    const statusMessage = ref(null);
    const resources = ref([]);
    const accesses = ref([]);
    const isEditing = ref(false);
    const currentResourceId = ref(null);

    const handleSubmit = async () => {
      if (isEditing.value) {
        await updateResource();
      } else {
        await uploadResource();
      }
    };

    const uploadResource = async () => {
      try {
        let resourceUrl = '';
        if (resourceType.value === 'file' && file.value) {
          const storage = getStorage();
          const fileRef = storageRef(storage, `resources/${file.value.name}`);
          await uploadBytes(fileRef, file.value);
          resourceUrl = await getDownloadURL(fileRef);
        } else {
          resourceUrl = link.value;
        }

        await addDoc(collection(db, 'resources'), {
          title: title.value,
          description: description.value,
          type: resourceType.value,
          url: resourceUrl,
          createdAt: new Date(),
        });

        statusMessage.value = 'Recurso enviado com sucesso!';
        setTimeout(() => { statusMessage.value = null; }, 5000); // Remove mensagem após 5 segundos

        fetchResources();
        // Limpar campos
        title.value = '';
        description.value = '';
        link.value = '';
        file.value = null;
        isEditing.value = false;
        currentResourceId.value = null;
      } catch (err) {
        statusMessage.value = 'Erro ao enviar o recurso. Tente novamente mais tarde.';
        setTimeout(() => { statusMessage.value = null; }, 5000); // Remove mensagem após 5 segundos
        console.error(err);
      }
    };

    const updateResource = async () => {
      try {
        let resourceUrl = '';
        if (resourceType.value === 'file' && file.value) {
          const storage = getStorage();
          const fileRef = storageRef(storage, `resources/${file.value.name}`);
          await uploadBytes(fileRef, file.value);
          resourceUrl = await getDownloadURL(fileRef);
        } else {
          resourceUrl = link.value;
        }

        await updateDoc(doc(db, 'resources', currentResourceId.value), {
          title: title.value,
          description: description.value,
          type: resourceType.value,
          url: resourceUrl,
        });

        statusMessage.value = 'Recurso atualizado com sucesso!';
        setTimeout(() => { statusMessage.value = null; }, 5000); // Remove mensagem após 5 segundos

        fetchResources();
        // Limpar campos
        title.value = '';
        description.value = '';
        link.value = '';
        file.value = null;
        isEditing.value = false;
        currentResourceId.value = null;
      } catch (err) {
        statusMessage.value = 'Erro ao atualizar o recurso. Tente novamente mais tarde.';
        setTimeout(() => { statusMessage.value = null; }, 5000); // Remove mensagem após 5 segundos
        console.error(err);
      }
    };

    const fetchResources = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'resources'));
        resources.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        statusMessage.value = 'Erro ao carregar os recursos.';
        setTimeout(() => { statusMessage.value = null; }, 5000); // Remove mensagem após 5 segundos
        console.error(err);
      }
    };

    const fetchAccessLogs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'access_logs'));
        accesses.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        statusMessage.value = 'Erro ao carregar os logs de acesso.';
        setTimeout(() => { statusMessage.value = null; }, 5000); // Remove mensagem após 5 segundos
        console.error(err);
      }
    };

    const deleteResource = async (resourceId) => {
      try {
        // Deletar o recurso do Firestore
        await deleteDoc(doc(db, 'resources', resourceId));
        statusMessage.value = 'Recurso excluído com sucesso!';
        setTimeout(() => { statusMessage.value = null; }, 5000); // Remove mensagem após 5 segundos
        fetchResources();
      } catch (err) {
        statusMessage.value = 'Erro ao excluir o recurso.';
        setTimeout(() => { statusMessage.value = null; }, 5000); // Remove mensagem após 5 segundos
        console.error(err);
      }
    };

    const editResource = (resource) => {
      title.value = resource.title;
      description.value = resource.description;
      resourceType.value = resource.type;
      link.value = resource.url;
      currentResourceId.value = resource.id;
      isEditing.value = true;
    };

    onMounted(() => {
      fetchResources();
      fetchAccessLogs();
      onSnapshot(collection(db, 'access_logs'), (snapshot) => {
        accesses.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      });
    });

    const handleFileUpload = (event) => {
      file.value = event.target.files[0];
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
      return date.toLocaleString();
    };

    return {
      title,
      description,
      resourceType,
      link,
      file,
      statusMessage,
      resources,
      accesses,
      handleSubmit,
      handleFileUpload,
      formatDate,
      deleteResource,
      editResource,
      updateResource,
      isEditing,
    };
  },
};
</script>

<style scoped>
.teacher-dashboard {
  padding: 20px;
  background: #f9f9f9;
  min-height: 100vh;
  font-family: "Arial", sans-serif;
}

.box {
  margin-bottom: 20px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.box h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 1.2rem;
}

.upload-form {
  margin-bottom: 20px;
}

.input-field {
  display: block;
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.textarea {
  height: 100px;
}

.resource-type {
  margin-bottom: 10px;
}

.file-input {
  margin-bottom: 10px;
}

.submit-button {
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
}

.submit-button:hover {
  background: #0056b3;
}

.resource-list {
  list-style: none;
  padding: 0;
}

.resource-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  position: relative;
}

.resource-link {
  color: #007bff;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.dropdown-content {
  display: none;
  position: absolute;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.dropdown-content a {
  display: block;
  padding: 8px 16px;
  color: #007bff;
  text-decoration: none;
}

.dropdown-content a:hover {
  background: #f1f1f1;
  cursor: pointer;
}

.dropdown:hover .dropdown-content {
  display: block;
}

.status-message {
  color: green;
  margin-bottom: 20px;
  font-weight: bold;
}

.access-table {
  width: 100%;
  border-collapse: collapse;
}

.access-table th,
.access-table td {
  border-bottom: 1px solid #ddd;
  padding: 10px;
  text-align: center;
  border: 1px solid #909090;
  text-align: center;
}

.access-table th {
  background-color: #f2f2f2;
}

.access-table tr:nth-child(even) {
  background-color: #f9f9f9;
}
</style>


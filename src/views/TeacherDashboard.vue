<template>
  <div class="teacher-dashboard">
    <h2>Bem-vindo, Professor!</h2>

    <!-- Caixa de Envio de Recursos -->
    <div class="box">
      <h3>{{ isEditing ? 'Editar Recurso' : 'Enviar Recurso' }} <ion-icon name="create-outline"></ion-icon></h3>
      <form @submit.prevent="handleSubmit" class="upload-form">
        <input v-model="title" type="text" placeholder="Título" required class="input-field" />
        <textarea v-model="description" placeholder="Descrição" required class="input-field textarea"></textarea>

        <div class="resource-type">
          <label>
            <input type="radio" value="file" v-model="resourceType" /> Arquivo <ion-icon name="document-outline"></ion-icon>
          </label>
          <label>
            <input type="radio" value="link" v-model="resourceType" /> Link <ion-icon name="link-outline"></ion-icon>
          </label>
        </div>

        <div v-if="resourceType === 'file'" class="file-upload">
          <input type="file" @change="handleFileUpload" class="file-input" />
        </div>
        <div v-else>
          <input v-model="link" type="url" placeholder="URL do Link" class="input-field" />
        </div>

        <button type="submit" class="submit-button">{{ isEditing ? 'Atualizar' : 'Enviar' }} <ion-icon name="send-outline"></ion-icon></button>
      </form>

      <!-- Mensagem de status -->
      <div v-if="statusMessage" class="status-message">
        <ion-icon name="information-circle-outline"></ion-icon> {{ statusMessage }}
      </div>
    </div>

    <!-- Caixa de Recursos Enviados -->
    <div class="box">
      <h3>Recursos Enviados <ion-icon name="albums-outline"></ion-icon></h3>
      <ul class="resource-list">
        <li v-for="resource in resources" :key="resource.id" class="resource-item">
          <strong>{{ resource.title }}</strong> - {{ resource.description }}
          <a :href="resource.url" target="_blank" class="resource-link">Acessar <ion-icon name="open-outline"></ion-icon></a>
          <div class="dropdown">
            <button class="dropdown-btn"><ion-icon name="ellipsis-vertical-outline"></ion-icon></button>
            <div class="dropdown-content">
              <a @click="editResource(resource)">Editar <ion-icon name="create-outline"></ion-icon></a>
              <a @click="deleteResource(resource.id)">Excluir <ion-icon name="trash-outline"></ion-icon></a>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Caixa de Monitoramento de Acessos -->
    <div class="box">
      <h3>Monitoramento de Acessos <ion-icon name="eye-outline"></ion-icon></h3>
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
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 15px;
}

.box h3 ion-icon {
  margin-left: 10px;
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

.resource-type{
  gap: 20px;
  flex-direction: row;
display: flex;
}
.resource-type label{
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.file-input {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  position: relative;
}

.file-input::before {
  content: 'Escolher arquivo';
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #333;
}

.file-input input[type="file"] {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-input .file-name {
  margin-left: 10px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #555;
}

.file-input:hover {
  border-color: #007bff;
  background: #f1f1f1;
}

.file-input:focus-within {
  border-color: #007bff;
  outline: none;
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
  display: flex;
  align-items: center;
}

.submit-button ion-icon {
  margin-left: 5px;
}

.resource-list {
  list-style-type: none;
  padding: 0;
}

.resource-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.resource-link {
  color: #007bff;
  text-decoration: none;
  margin-right: 20px;
}

.resource-link:hover {
  text-decoration: underline;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-btn {
  background: none;
  border: none;
  cursor: pointer;
}

.dropdown-content {
  display: none;
  position: absolute;
  right: 0;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
  border-radius: 8px;
}

.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.dropdown-content a:hover {
  background-color: #f1f1f1;
}

.dropdown:hover .dropdown-content {
  display: block;
}

.status-message {
  margin-top: 10px;
  padding: 10px;
  background-color: #e7f3fe;
  border-left: 6px solid #2196F3;
  color: #31708f;
  border-radius: 8px;
  display: flex;
  align-items: center;
}

.status-message ion-icon {
  margin-right: 10px;
}

.access-table {
  width: 100%;
  border-collapse: collapse;
}

.access-table th, .access-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.access-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.access-table td {
  background-color: #fff;
}

.access-table tr:nth-child(even) {
  background-color: #f9f9f9;
}


.teacher-dashboard ion-icon {
  margin-left: 8px;
  margin-right: 8px;
}

</style>


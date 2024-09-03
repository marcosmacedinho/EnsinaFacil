<!-- src/components/Alert.vue -->
<template>
  <div v-if="visible" class="alert" :class="`alert-${type}`">
    <span>{{ message }}</span>
    <div class="slider" :style="{ width: sliderWidth + '%' }"></div>
    <button @click="closeAlert" class="close-btn">&times;</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      message: '',
      type: 'error', // error, success
      sliderWidth: 100,
      timer: null,
    };
  },
  methods: {
    showAlert(message, type = 'error') {
      this.message = message;
      this.type = type;
      this.visible = true;
      this.sliderWidth = 100;

      if (this.timer) clearInterval(this.timer);

      this.timer = setInterval(() => {
        this.sliderWidth -= 2; // Ajuste o decremento conforme necessário
        if (this.sliderWidth <= 0) {
          this.closeAlert();
        }
      }, 100); // 100 ms para um total de 5 segundos

      setTimeout(this.closeAlert, 5000); // Fecha automaticamente após 5 segundos
    },
    closeAlert() {
      this.visible = false;
      if (this.timer) clearInterval(this.timer);
    },
  },
};
</script>

<style scoped>
.alert {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1em;
  max-width: 350px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.4em;
  color: inherit;
  cursor: pointer;
  margin-left: 10px;
}

.slider {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background-color: currentColor;
  transition: width 0.1s linear;
}
</style>

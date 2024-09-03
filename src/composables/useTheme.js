import { ref } from 'vue';

export function useTheme() {
  const isDarkMode = ref(false);

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  };

  return {
    isDarkMode,
    toggleTheme
  };
}

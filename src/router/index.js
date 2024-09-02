// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { auth, db } from '../firebase';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import StudentDashboard from '../views/StudentDashboard.vue';
import TeacherDashboard from '../views/TeacherDashboard.vue';
import { doc, getDoc } from 'firebase/firestore';

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  {
    path: '/student-dashboard',
    name: 'StudentDashboard',
    component: StudentDashboard,
    meta: { requiresAuth: true, role: 'student' },
  },
  {
    path: '/teacher-dashboard',
    name: 'TeacherDashboard',
    component: TeacherDashboard,
    meta: { requiresAuth: true, role: 'teacher' },
  },
  { path: '/', redirect: '/login' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const user = auth.currentUser;
  
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!user) {
      next({ name: 'Login' });
    } else {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userRole = userDoc.data().role;

          if (to.meta.role && userRole !== to.meta.role) {
            next({ name: 'Login' });
          } else {
            next();
          }
        } else {
          console.error('Documento do usuário não encontrado no Firestore.');
          next({ name: 'Login' });
        }
      } catch (error) {
        console.error('Erro ao verificar o papel do usuário:', error);
        next({ name: 'Login' });
      }
    }
  } else {
    next();
  }
});

export default router;

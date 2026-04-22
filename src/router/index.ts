import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import AdminLayout from '@/layouts/AdminLayout.vue';
import { useAuthStore } from '@/stores/authStore';
import { USE_MOCK_API } from '@/services/api';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: AdminLayout,
    children: [
      { path: '', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },

      // Patients
      { path: 'patients', name: 'patients.list', component: () => import('@/views/patients/PatientListView.vue') },
      { path: 'patients/new', name: 'patients.new', component: () => import('@/views/patients/PatientNewView.vue') },
      {
        path: 'patients/:id',
        name: 'patients.detail',
        component: () => import('@/views/patients/PatientDetailView.vue'),
        props: true,
      },

      // Plans
      { path: 'plans', name: 'plans.list', component: () => import('@/views/plans/PlanListView.vue') },
      {
        path: 'plans/:id',
        name: 'plans.edit',
        component: () => import('@/views/plans/PlanEditorView.vue'),
        props: true,
      },

      // Videos
      { path: 'videos', name: 'videos.list', component: () => import('@/views/videos/VideoListView.vue') },
      { path: 'videos/new', name: 'videos.new', component: () => import('@/views/videos/VideoFormView.vue') },
      {
        path: 'videos/:id/edit',
        name: 'videos.edit',
        component: () => import('@/views/videos/VideoFormView.vue'),
        props: true,
      },

      // Messages (WhatsApp inbox)
      { path: 'messages', name: 'messages.inbox', component: () => import('@/views/messages/InboxView.vue') },
      {
        path: 'messages/:patientId',
        name: 'messages.thread',
        component: () => import('@/views/messages/InboxView.vue'),
        props: true,
      },

      // Settings
      { path: 'settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },

      // 404
      { path: ':pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
    ],
  },
];

const router = createRouter({
  history: createWebHistory('/'),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

/**
 * Auth guard. In mock mode, treats the default admin as logged-in so the mockup
 * is immediately usable without a login detour. In live mode (VITE_USE_MOCK_API=false),
 * redirects unauthenticated users to /login.
 *
 * To REQUIRE login even in mock mode, flip `MOCK_AUTO_LOGIN` to false.
 */
const MOCK_AUTO_LOGIN = true;

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.restore();

  if (USE_MOCK_API && MOCK_AUTO_LOGIN && !auth.isAuthenticated) {
    const { STAFF } = await import('@/data/staff');
    auth.$patch({ user: STAFF[0], bootstrapped: true });
    return true;
  }

  if (to.meta.public) return true;
  if (!auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  return true;
});

export default router;

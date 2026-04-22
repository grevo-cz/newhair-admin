import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import AdminLayout from '@/layouts/AdminLayout.vue';

const routes: RouteRecordRaw[] = [
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

export default createRouter({
  history: createWebHistory('/'),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

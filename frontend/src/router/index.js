import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Auth
import LoginPage from '../views/auth/LoginPage.vue'

// Patient Views
import PatientDashboard from '../views/patient/Dashboard.vue'
import BloodPressureInput from '../views/patient/BloodPressureInput.vue'
import Monitoring from '../views/patient/Monitoring.vue'
import Recommendations from '../views/patient/Recommendations.vue'
import PatientChat from '../views/patient/Chat.vue'
import PatientProfile from '../views/patient/Profile.vue'
import LifestyleInput from '../views/patient/LifestyleInput.vue'
import Prescriptions from '../views/patient/Prescriptions.vue'

// Doctor Views
import DoctorDashboard from '../views/doctor/Dashboard.vue'
import PatientList from '../views/doctor/PatientList.vue'
import PatientDetail from '../views/doctor/PatientDetail.vue'
import DoctorRecommendations from '../views/doctor/Recommendations.vue'
import DoctorChat from '../views/doctor/Chat.vue'

// Nurse Views
import NurseDashboard from '../views/nurse/Dashboard.vue'
import NursePatientAssist from '../views/nurse/PatientAssist.vue'
import NurseChat from '../views/nurse/Chat.vue'

// Admin Views
import AdminDashboard from '../views/admin/Dashboard.vue'
import UserManagement from '../views/admin/UserManagement.vue'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: LoginPage,
        meta: { guest: true }
    },
    {
        path: '/',
        redirect: '/dashboard'
    },

    // Patient Routes
    {
        path: '/dashboard',
        name: 'PatientDashboard',
        component: PatientDashboard,
        meta: { requiresAuth: true, roles: ['patient'] }
    },
    {
        path: '/blood-pressure',
        name: 'BloodPressureInput',
        component: BloodPressureInput,
        meta: { requiresAuth: true, roles: ['patient'] }
    },
    {
        path: '/monitoring',
        name: 'Monitoring',
        component: Monitoring,
        meta: { requiresAuth: true, roles: ['patient'] }
    },
    {
        path: '/recommendations',
        name: 'Recommendations',
        component: Recommendations,
        meta: { requiresAuth: true, roles: ['patient'] }
    },
    {
        path: '/chat',
        name: 'PatientChat',
        component: PatientChat,
        meta: { requiresAuth: true, roles: ['patient'] }
    },
    {
        path: '/profile',
        name: 'PatientProfile',
        component: PatientProfile,
        meta: { requiresAuth: true, roles: ['patient'] }
    },
    {
        path: '/lifestyle',
        name: 'LifestyleInput',
        component: LifestyleInput,
        meta: { requiresAuth: true, roles: ['patient'] }
    },
    {
        path: '/prescriptions',
        name: 'Prescriptions',
        component: Prescriptions,
        meta: { requiresAuth: true, roles: ['patient'] }
    },

    // Doctor Routes
    {
        path: '/doctor/dashboard',
        name: 'DoctorDashboard',
        component: DoctorDashboard,
        meta: { requiresAuth: true, roles: ['doctor'] }
    },
    {
        path: '/doctor/patients',
        name: 'PatientList',
        component: PatientList,
        meta: { requiresAuth: true, roles: ['doctor'] }
    },
    {
        path: '/doctor/patients/:id',
        name: 'PatientDetail',
        component: PatientDetail,
        meta: { requiresAuth: true, roles: ['doctor'] }
    },
    {
        path: '/doctor/recommendations',
        name: 'DoctorRecommendations',
        component: DoctorRecommendations,
        meta: { requiresAuth: true, roles: ['doctor'] }
    },
    {
        path: '/doctor/chat',
        name: 'DoctorChat',
        component: DoctorChat,
        meta: { requiresAuth: true, roles: ['doctor'] }
    },

    // Nurse Routes
    {
        path: '/nurse/dashboard',
        name: 'NurseDashboard',
        component: NurseDashboard,
        meta: { requiresAuth: true, roles: ['nurse'] }
    },
    {
        path: '/nurse/patient-assist',
        name: 'NursePatientAssist',
        component: NursePatientAssist,
        meta: { requiresAuth: true, roles: ['nurse'] }
    },
    {
        path: '/nurse/chat',
        name: 'NurseChat',
        component: NurseChat,
        meta: { requiresAuth: true, roles: ['nurse'] }
    },

    // Admin Routes
    {
        path: '/admin/dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
        path: '/admin/users',
        name: 'UserManagement',
        component: UserManagement,
        meta: { requiresAuth: true, roles: ['admin'] }
    },

    // Catch all
    {
        path: '/:pathMatch(.*)*',
        redirect: '/login'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation Guards
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    const token = localStorage.getItem('token')

    if (to.meta.requiresAuth) {
        if (!token) {
            return next('/login')
        }

        // Fetch user if not loaded
        if (!authStore.user && token) {
            try {
                await authStore.fetchUser()
            } catch (error) {
                authStore.logout()
                return next('/login')
            }
        }

        // Check role access
        if (to.meta.roles && authStore.user) {
            if (!to.meta.roles.includes(authStore.user.role)) {
                // Redirect to appropriate dashboard
                const dashboardMap = {
                    patient: '/dashboard',
                    doctor: '/doctor/dashboard',
                    nurse: '/nurse/dashboard',
                    admin: '/admin/dashboard'
                }
                return next(dashboardMap[authStore.user.role] || '/login')
            }
        }
    }

    if (to.meta.guest && token && authStore.user) {
        const dashboardMap = {
            patient: '/dashboard',
            doctor: '/doctor/dashboard',
            nurse: '/nurse/dashboard',
            admin: '/admin/dashboard'
        }
        return next(dashboardMap[authStore.user.role] || '/dashboard')
    }

    next()
})

export default router

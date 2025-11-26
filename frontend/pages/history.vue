<template>
  <div class="flex-1 p-8 overflow-auto bg-slate-50">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-3xl font-bold text-slate-800">{{ $t('history.title') }}</h2>
          <p class="text-slate-500 mt-1">{{ $t('history.projectsCount', { count: projects.length }) }}</p>
        </div>
        <NuxtLink to="/estimation" class="btn-primary">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('nav.newEstimation') }}
        </NuxtLink>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="card p-12 text-center">
        <svg class="w-8 h-8 animate-spin mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p class="text-slate-500 mt-4">{{ $t('history.loadingProjects') }}</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="projects.length === 0" class="card p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <h3 class="text-lg font-medium text-slate-700 mt-4">{{ $t('history.noProjects') }}</h3>
        <p class="text-slate-500 mt-2">{{ $t('history.noProjectsDescription') }}</p>
        <NuxtLink to="/estimation" class="btn-primary mt-6 inline-flex">
          {{ $t('nav.newEstimation') }}
        </NuxtLink>
      </div>

      <!-- Projects table -->
      <div v-else class="card overflow-hidden">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left py-4 px-6 text-sm font-medium text-slate-500">{{ $t('history.project') }}</th>
              <th class="text-left py-4 px-6 text-sm font-medium text-slate-500">{{ $t('history.date') }}</th>
              <th class="text-center py-4 px-6 text-sm font-medium text-slate-500">{{ $t('history.stack') }}</th>
              <th class="text-right py-4 px-6 text-sm font-medium text-slate-500">{{ $t('history.workload') }}</th>
              <th class="text-right py-4 px-6 text-sm font-medium text-slate-500">{{ $t('history.budget') }}</th>
              <th class="text-center py-4 px-6 text-sm font-medium text-slate-500">{{ $t('history.status') }}</th>
              <th class="text-right py-4 px-6 text-sm font-medium text-slate-500">{{ $t('history.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="project in projects"
              :key="project.id"
              class="border-b border-slate-100 hover:bg-slate-50"
            >
              <td class="py-4 px-6">
                <p class="font-medium text-slate-800">{{ project.name }}</p>
              </td>
              <td class="py-4 px-6 text-sm text-slate-500">
                {{ formatDate(project.date_created) }}
              </td>
              <td class="py-4 px-6 text-center">
                <span :class="getStackBadgeClass(project.stack)">
                  {{ $t('history.stackLabel', { stack: project.stack }) }}
                </span>
              </td>
              <td class="py-4 px-6 text-right text-sm text-slate-600">
                {{ project.total_days }} j
              </td>
              <td class="py-4 px-6 text-right text-sm font-medium text-slate-800">
                {{ formatCurrency(project.total_budget) }}
              </td>
              <td class="py-4 px-6 text-center">
                <span :class="getStatusBadgeClass(project.status)">
                  {{ getStatusLabel(project.status) }}
                </span>
              </td>
              <td class="py-4 px-6 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="viewProject(project)"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    :title="$t('history.view')"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    @click="updateStatus(project, 'validated')"
                    v-if="project.status !== 'validated'"
                    class="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    :title="$t('history.validate')"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    @click="deleteProject(project)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    :title="$t('common.delete')"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project, StackId } from '~/types'
import { STACK_CONFIG } from '~/config/data'

definePageMeta({
  middleware: 'auth',
})

const { getProjects, updateProject, deleteProject: deleteProjectApi } = useDirectus()
const { formatCurrency } = useEstimation()
const { t, locale } = useI18n()
const store = useEstimationStore()

const projects = ref<Project[]>([])
const isLoading = ref(true)

onMounted(async () => {
  await loadProjects()
})

const loadProjects = async () => {
  isLoading.value = true
  projects.value = await getProjects()
  isLoading.value = false
}

const formatDate = (dateString: string): string => {
  const localeCode = locale.value === 'en' ? 'en-US' : 'fr-FR'
  return new Date(dateString).toLocaleDateString(localeCode, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const getStackBadgeClass = (stack: StackId): string => {
  return STACK_CONFIG[stack]?.badgeClass || 'badge-neutral'
}

const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'validated':
      return 'badge-success'
    case 'pending':
      return 'badge-warning'
    default:
      return 'badge-neutral'
  }
}

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'validated':
      return t('history.statusValidated')
    case 'pending':
      return t('history.statusPending')
    default:
      return t('history.statusDraft')
  }
}

const viewProject = async (project: Project) => {
  try {
    await store.loadProject(project.id)
    navigateTo('/estimation/result')
  } catch (error) {
    console.error('Error loading project:', error)
  }
}

const updateStatus = async (project: Project, status: 'draft' | 'pending' | 'validated') => {
  await updateProject(project.id, { status })
  await loadProjects()
}

const deleteProject = async (project: Project) => {
  if (!confirm(t('history.confirmDelete', { name: project.name }))) return

  await deleteProjectApi(project.id)
  await loadProjects()
}
</script>

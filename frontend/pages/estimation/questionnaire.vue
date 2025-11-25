<template>
  <div class="flex-1 p-8 overflow-auto bg-slate-50">
    <div class="max-w-3xl mx-auto">
      <!-- Progress bar -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-slate-500">
            Question {{ store.currentStep + 1 }} / {{ store.totalSteps }}
          </span>
          <span class="text-sm font-medium text-blue-600">{{ store.progress }}%</span>
        </div>
        <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-blue-600 transition-all duration-300"
            :style="{ width: `${store.progress}%` }"
          />
        </div>
      </div>

      <!-- AI suggestions indicator -->
      <div v-if="store.useAiSuggestions && store.aiAnalysis" class="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
        <IconBrain class="w-5 h-5 text-blue-600" />
        <span class="text-sm text-blue-700">
          Réponses pré-remplies par l'analyse IA — vous pouvez les modifier
        </span>
        <button @click="store.clearAiSuggestions()" class="ml-auto text-sm text-blue-600 hover:underline">
          Effacer
        </button>
      </div>

      <!-- Question card -->
      <div v-if="store.currentQuestion" class="card p-8">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <component :is="questionIcon" class="w-6 h-6 text-blue-600" />
          </div>
          <h2 class="text-xl font-semibold text-slate-800">
            {{ store.currentQuestion.question }}
          </h2>
        </div>

        <!-- Options -->
        <div class="space-y-3">
          <button
            v-for="option in store.currentQuestion.options"
            :key="option.value"
            @click="handleOptionClick(option.value)"
            class="w-full text-left p-4 rounded-xl border-2 transition-all"
            :class="[
              isSelected(option.value)
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50',
              aiSuggestedValue === option.value && !isSelected(option.value)
                ? 'ring-2 ring-blue-200 ring-offset-2'
                : ''
            ]"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium text-slate-700">{{ option.label }}</span>
              <div class="flex items-center gap-2">
                <span v-if="aiSuggestedValue === option.value" class="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                  Suggéré par IA
                </span>
                <div
                  class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition"
                  :class="
                    isSelected(option.value)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-slate-300'
                  "
                >
                  <svg
                    v-if="isSelected(option.value)"
                    class="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <p v-if="option.note" class="text-sm text-slate-500 mt-1">
              {{ option.note }}
            </p>
          </button>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between mt-8">
          <button
            v-if="store.currentStep > 0"
            @click="store.prevStep"
            class="btn-secondary"
          >
            <IconArrowLeft class="w-4 h-4" />
            Précédent
          </button>
          <button
            v-else
            @click="goBack"
            class="btn-secondary"
          >
            <IconArrowLeft class="w-4 h-4" />
            Retour
          </button>

          <button
            v-if="store.currentStep < store.totalSteps - 1"
            @click="store.nextStep"
            :disabled="!store.isCurrentStepAnswered"
            class="btn-primary"
          >
            Suivant
            <IconArrowRight class="w-4 h-4" />
          </button>
          <button
            v-else
            @click="goToResult"
            :disabled="!store.isComplete"
            class="btn-primary"
          >
            Voir le résultat
            <IconArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QUESTIONS } from '~/config/data'

definePageMeta({
  middleware: 'auth',
})

const store = useEstimationStore()

// Load TJM profiles
onMounted(async () => {
  await store.loadTjmProfiles()
})

const questionIcon = computed(() => {
  const iconMap: Record<string, any> = {
    'building-2': resolveComponent('IconBuilding'),
    layers: resolveComponent('IconLayers'),
    globe: resolveComponent('IconGlobe'),
    zap: resolveComponent('IconZap'),
    users: resolveComponent('IconUsers'),
    shield: resolveComponent('IconShield'),
    clock: resolveComponent('IconClock'),
  }
  return iconMap[store.currentQuestion?.icon || 'box'] || resolveComponent('IconBox')
})

// Get AI suggested value for current question
const aiSuggestedValue = computed(() => {
  if (!store.aiAnalysis?.questionnaire || !store.currentQuestion) return null
  const questionId = store.currentQuestion.id
  const suggestion = store.aiAnalysis.questionnaire[questionId as keyof typeof store.aiAnalysis.questionnaire]
  if (!suggestion) return null
  return suggestion.value || (suggestion.values ? suggestion.values[0] : null)
})

const isSelected = (value: string): boolean => {
  const answer = store.answers[store.currentQuestion.id]
  if (store.currentQuestion.multiSelect) {
    return Array.isArray(answer) && answer.includes(value)
  }
  return answer === value
}

const handleOptionClick = (value: string) => {
  if (store.currentQuestion.multiSelect) {
    store.toggleMultiSelectAnswer(store.currentQuestion.id, value)
  } else {
    store.setAnswer(store.currentQuestion.id, value)
  }
}

const goBack = () => {
  navigateTo('/estimation')
}

const goToResult = () => {
  if (store.isComplete) {
    navigateTo('/estimation/result')
  }
}
</script>

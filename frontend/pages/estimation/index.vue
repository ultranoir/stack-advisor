<template>
  <div class="flex-1 p-8 overflow-auto bg-slate-50">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-slate-800">Nouvelle estimation</h2>
        <p class="text-slate-500 mt-1">
          Uploadez un document pour une analyse automatique, ou passez directement au questionnaire
        </p>
      </div>

      <!-- Upload section -->
      <div class="card p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <IconUpload class="w-5 h-5 text-blue-600" />
            Upload de document (optionnel)
          </h3>
          
          <!-- Model selector -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-slate-600">Modèle Claude :</label>
            <select
              v-model="store.selectedModel"
              class="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              :disabled="store.isAnalyzing"
            >
              <option value="claude-haiku-4-20250514">Haiku (rapide)</option>
              <option value="claude-sonnet-4-20250514">Sonnet (équilibré)</option>
              <option value="claude-opus-4-20250514">Opus (puissant)</option>
            </select>
          </div>
        </div>
        
        <div
          class="border-2 border-dashed rounded-xl p-8 text-center transition-colors"
          :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400'"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            accept=".pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            @change="handleFileSelect"
          />
          
          <div v-if="!isUploading && store.uploadedDocuments.length === 0">
            <IconDocument class="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p class="text-slate-600 mb-2">
              Glissez-déposez votre document ici
            </p>
            <p class="text-sm text-slate-400 mb-4">
              Formats acceptés : PDF, Word (.docx), PowerPoint (.pptx)
            </p>
            <button @click="fileInput?.click()" class="btn-secondary">
              Parcourir
            </button>
          </div>
          
          <div v-else-if="isUploading" class="py-4">
            <svg class="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p class="text-slate-600">Upload en cours...</p>
          </div>
        </div>
        
        <!-- Uploaded files list -->
        <div v-if="store.uploadedDocuments.length > 0" class="mt-4 space-y-2">
          <div
            v-for="doc in store.uploadedDocuments"
            :key="doc.id"
            class="flex items-center justify-between p-3 bg-slate-100 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <IconDocument class="w-5 h-5 text-blue-600" />
              <span class="text-sm text-slate-700">{{ doc.filename }}</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="!store.aiAnalysis || store.aiAnalysis.meta?.fileId !== doc.id"
                @click="analyzeDocument(doc.id)"
                :disabled="store.isAnalyzing"
                class="btn-secondary text-sm py-1 px-3"
              >
                <IconBrain class="w-4 h-4" />
                Analyser
              </button>
              <span v-else class="text-sm text-green-600 flex items-center gap-1">
                <IconCheck class="w-4 h-4" />
                Analysé
              </span>
              <button
                @click="removeDocument(doc.id)"
                class="p-1 text-slate-400 hover:text-red-500 transition"
              >
                <IconTrash class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <!-- Error message -->
        <div v-if="store.analysisError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ store.analysisError }}
        </div>
      </div>

      <!-- Analysis loading -->
      <div v-if="store.isAnalyzing" class="card p-8 mb-6 text-center">
        <svg class="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <h4 class="text-lg font-semibold text-slate-800 mb-2">Analyse en cours...</h4>
        <p class="text-slate-500">Claude analyse votre document pour identifier les besoins</p>
      </div>

      <!-- AI Analysis results -->
      <div v-if="store.aiAnalysis && !store.isAnalyzing" class="space-y-6 mb-6">
        <!-- Toggle view -->
        <div class="flex gap-2">
          <button
            @click="viewMode = 'summary'"
            class="flex-1 py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2"
            :class="viewMode === 'summary' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'"
          >
            <IconDocument class="w-5 h-5" />
            Résumé du brief
          </button>
          <button
            @click="viewMode = 'questionnaire'"
            class="flex-1 py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2"
            :class="viewMode === 'questionnaire' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'"
          >
            <IconClipboard class="w-5 h-5" />
            Questions pré-remplies
          </button>
        </div>

        <!-- Summary view -->
        <div v-if="viewMode === 'summary'" class="card p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-xl font-bold text-slate-800">
                {{ store.aiAnalysis.summary.title || 'Analyse du brief' }}
              </h3>
              <p v-if="store.aiAnalysis.summary.client" class="text-slate-500">
                Client : {{ store.aiAnalysis.summary.client }}
              </p>
            </div>
            <div 
              class="px-3 py-1 rounded-full text-sm font-medium"
              :class="complexityBadgeClass"
            >
              Complexité : {{ store.aiAnalysis.complexity.score }}/10
            </div>
          </div>

          <!-- Context -->
          <div class="mb-6">
            <h4 class="text-sm font-semibold text-slate-500 uppercase mb-2">Contexte</h4>
            <p class="text-slate-700">{{ store.aiAnalysis.summary.context }}</p>
          </div>

          <!-- Grid sections -->
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Objectives -->
            <div>
              <h4 class="text-sm font-semibold text-slate-500 uppercase mb-2">Objectifs</h4>
              <ul class="space-y-1">
                <li v-for="obj in store.aiAnalysis.summary.objectives" :key="obj" class="flex items-start gap-2 text-sm text-slate-700">
                  <span class="text-green-500 mt-1">•</span>
                  {{ obj }}
                </li>
              </ul>
            </div>

            <!-- Key features -->
            <div>
              <h4 class="text-sm font-semibold text-slate-500 uppercase mb-2">Fonctionnalités clés</h4>
              <ul class="space-y-1">
                <li v-for="feat in store.aiAnalysis.summary.keyFeatures" :key="feat" class="flex items-start gap-2 text-sm text-slate-700">
                  <span class="text-blue-500 mt-1">•</span>
                  {{ feat }}
                </li>
              </ul>
            </div>

            <!-- Constraints -->
            <div>
              <h4 class="text-sm font-semibold text-slate-500 uppercase mb-2">Contraintes</h4>
              <ul class="space-y-1">
                <li v-for="con in store.aiAnalysis.summary.constraints" :key="con" class="flex items-start gap-2 text-sm text-slate-700">
                  <span class="text-amber-500 mt-1">•</span>
                  {{ con }}
                </li>
              </ul>
            </div>

            <!-- Risks -->
            <div>
              <h4 class="text-sm font-semibold text-slate-500 uppercase mb-2">Points d'attention</h4>
              <ul class="space-y-1">
                <li v-for="risk in store.aiAnalysis.summary.risks" :key="risk" class="flex items-start gap-2 text-sm text-slate-700">
                  <span class="text-red-500 mt-1">•</span>
                  {{ risk }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Missing info -->
          <div v-if="store.aiAnalysis.missingInfo?.length" class="mt-6 p-4 bg-amber-50 rounded-lg">
            <h4 class="text-sm font-semibold text-amber-800 mb-2">Informations manquantes</h4>
            <ul class="space-y-1">
              <li v-for="info in store.aiAnalysis.missingInfo" :key="info" class="text-sm text-amber-700">
                • {{ info }}
              </li>
            </ul>
          </div>

          <!-- Suggested stack -->
          <div class="mt-6 p-4 rounded-lg" :class="stackBgClass">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-semibold" :class="stackTextClass">
                  Stack recommandée : {{ store.aiAnalysis.complexity.suggestedStack }}
                </h4>
                <p class="text-sm text-slate-600 mt-1">
                  {{ store.aiAnalysis.complexity.explanation }}
                </p>
              </div>
            </div>
          </div>

          <!-- Meta info -->
          <div class="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-400 flex items-center gap-4">
            <span>Analysé le {{ formatDate(store.aiAnalysis.meta.analyzedAt) }}</span>
            <span>{{ store.aiAnalysis.meta.tokensUsed }} tokens</span>
            <span>{{ store.aiAnalysis.meta.model }}</span>
          </div>
        </div>

        <!-- Questionnaire view -->
        <div v-if="viewMode === 'questionnaire'" class="card p-6">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">Réponses suggérées par l'analyse</h3>
          
          <div class="space-y-4">
            <div
              v-for="question in questionsWithSuggestions"
              :key="question.id"
              class="p-4 rounded-lg"
              :class="question.confidence >= 0.7 ? 'bg-green-50' : question.confidence >= 0.4 ? 'bg-amber-50' : 'bg-slate-50'"
            >
              <div class="flex items-start justify-between mb-2">
                <h4 class="font-medium text-slate-800">{{ question.label }}</h4>
                <span 
                  class="text-xs px-2 py-1 rounded-full"
                  :class="question.confidence >= 0.7 ? 'bg-green-200 text-green-800' : question.confidence >= 0.4 ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-600'"
                >
                  {{ Math.round(question.confidence * 100) }}% confiance
                </span>
              </div>
              <p class="text-blue-600 font-medium">{{ question.answer }}</p>
              <p class="text-sm text-slate-500 mt-1">{{ question.reasoning }}</p>
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button @click="applyAndContinue" class="btn-primary flex-1">
              Appliquer et continuer
            </button>
            <button @click="skipAndContinue" class="btn-secondary">
              Ignorer les suggestions
            </button>
          </div>
        </div>
      </div>

      <!-- Chat with Claude -->
      <ChatWithClaude />

      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <button 
          v-if="!store.aiAnalysis"
          @click="skipToQuestionnaire" 
          class="btn-primary"
        >
          Passer au questionnaire
          <IconArrowRight class="w-4 h-4" />
        </button>
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
const { uploadFile, analyzeDocument: analyzeDoc } = useDirectus()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isUploading = ref(false)
const viewMode = ref<'summary' | 'questionnaire'>('summary')

// Question labels map
const questionLabels: Record<string, string> = {
  projectType: 'Typologie du projet',
  dataComplexity: 'Complexité des données',
  multilingual: 'Multilingue',
  integrations: 'Intégrations tierces',
  accessibility: 'Accessibilité',
  security: 'Sécurité',
  deadline: 'Planning',
}

// Get option label from value
const getOptionLabel = (questionId: string, value: string | string[]): string => {
  const question = QUESTIONS.find(q => q.id === questionId)
  if (!question) return String(value)
  
  if (Array.isArray(value)) {
    return value.map(v => {
      const opt = question.options.find(o => o.value === v)
      return opt?.label || v
    }).join(', ')
  }
  
  const opt = question.options.find(o => o.value === value)
  return opt?.label || value
}

// Questions with AI suggestions
const questionsWithSuggestions = computed(() => {
  if (!store.aiAnalysis?.questionnaire) return []
  
  const q = store.aiAnalysis.questionnaire
  
  return Object.entries(q).map(([id, data]) => ({
    id,
    label: questionLabels[id] || id,
    answer: getOptionLabel(id, data.value || data.values || ''),
    confidence: data.confidence,
    reasoning: data.reasoning,
  }))
})

// Complexity badge styling
const complexityBadgeClass = computed(() => {
  const score = store.aiAnalysis?.complexity.score || 0
  if (score <= 3) return 'bg-green-100 text-green-800'
  if (score <= 6) return 'bg-amber-100 text-amber-800'
  return 'bg-red-100 text-red-800'
})

// Stack styling
const stackBgClass = computed(() => {
  const stack = store.aiAnalysis?.complexity.suggestedStack
  if (stack === 'A') return 'bg-amber-50'
  if (stack === 'C') return 'bg-emerald-50'
  return 'bg-blue-50'
})

const stackTextClass = computed(() => {
  const stack = store.aiAnalysis?.complexity.suggestedStack
  if (stack === 'A') return 'text-amber-800'
  if (stack === 'C') return 'text-emerald-800'
  return 'text-blue-800'
})

// File handling
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) await uploadDocument(file)
}

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) await uploadDocument(file)
}

const uploadDocument = async (file: File) => {
  const validTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ]
  
  if (!validTypes.includes(file.type)) {
    store.setAnalysisError('Format non supporté. Utilisez PDF, Word ou PowerPoint.')
    return
  }
  
  isUploading.value = true
  store.setAnalysisError(null)
  
  try {
    const result = await uploadFile(file)
    if (result) {
      store.addDocument(result)
    } else {
      store.setAnalysisError('Erreur lors de l\'upload du fichier')
    }
  } catch (error: any) {
    store.setAnalysisError(error.message || 'Erreur lors de l\'upload')
  } finally {
    isUploading.value = false
  }
}

const removeDocument = (fileId: string) => {
  store.removeDocument(fileId)
}

const analyzeDocument = async (fileId: string) => {
  store.setAnalyzing(true)
  store.setAnalysisError(null)
  
  try {
    const analysis = await analyzeDoc(fileId, store.selectedModel)
    store.setAiAnalysis(analysis)
    viewMode.value = 'summary'
  } catch (error: any) {
    store.setAnalysisError(error.message || 'Erreur lors de l\'analyse')
  } finally {
    store.setAnalyzing(false)
  }
}

const applyAndContinue = () => {
  store.applyAiSuggestions()
  navigateTo('/estimation/questionnaire')
}

const skipAndContinue = () => {
  store.clearAiSuggestions()
  navigateTo('/estimation/questionnaire')
}

const skipToQuestionnaire = () => {
  navigateTo('/estimation/questionnaire')
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

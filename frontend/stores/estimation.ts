import { defineStore } from 'pinia'
import type { Answers, Recommendation, StackId, BudgetBreakdownItem, TjmProfile, DiscountType, AIAnalysis, UploadedDocument, ConversationMessage, ClaudeModel } from '~/types'
import { QUESTIONS } from '~/config/data'

interface EstimationState {
  currentStep: number
  answers: Answers
  projectName: string
  estimationType: 'quick' | 'detailed'
  tjmProfiles: TjmProfile[]
  distribution: Record<string, number>
  tjmOverrides: Record<string, number>
  daysOverrides: Record<string, number>
  discountType: DiscountType
  discountValue: number
  savedProjectId: string | null
  projectStatus: 'draft' | 'pending' | 'validated'
  isLoadingTjm: boolean
  tjmError: string | null
  // Document analysis
  uploadedDocuments: UploadedDocument[]
  aiAnalysis: AIAnalysis | null
  isAnalyzing: boolean
  analysisError: string | null
  useAiSuggestions: boolean
  // Chat with Claude
  conversationHistory: ConversationMessage[]
  selectedModel: ClaudeModel
  isChatting: boolean
  chatError: string | null
}

export const useEstimationStore = defineStore('estimation', {
  state: (): EstimationState => ({
    currentStep: 0,
    answers: {},
    projectName: '',
    estimationType: 'quick',
    tjmProfiles: [],
    distribution: {},
    tjmOverrides: {},
    daysOverrides: {},
    discountType: 'none',
    discountValue: 0,
    savedProjectId: null,
    projectStatus: 'draft',
    isLoadingTjm: false,
    tjmError: null,
    // Document analysis
    uploadedDocuments: [],
    aiAnalysis: null,
    isAnalyzing: false,
    analysisError: null,
    useAiSuggestions: false,
    // Chat with Claude
    conversationHistory: [],
    selectedModel: 'claude-sonnet-4-20250514',
    isChatting: false,
    chatError: null,
  }),

  getters: {
    totalSteps: () => QUESTIONS.length,
    
    currentQuestion: (state) => QUESTIONS[state.currentStep],
    
    progress: (state): number => {
      return Math.round(((state.currentStep + 1) / QUESTIONS.length) * 100)
    },
    
    isCurrentStepAnswered: (state): boolean => {
      const question = QUESTIONS[state.currentStep]
      const answer = state.answers[question.id]
      
      if (question.multiSelect) {
        return Array.isArray(answer) && answer.length > 0
      }
      return !!answer
    },
    
    isComplete: (state): boolean => {
      return QUESTIONS.every((question) => {
        const answer = state.answers[question.id]
        if (question.multiSelect) {
          return Array.isArray(answer) && answer.length > 0
        }
        return !!answer
      })
    },
    
    recommendation(): Recommendation | null {
      if (!this.isComplete) return null
      const { calculateRecommendation } = useEstimation()
      return calculateRecommendation(this.answers)
    },
    
    totalDistributionPercentage: (state): number => {
      return Object.values(state.distribution).reduce((sum, val) => sum + val, 0)
    },
    
    hasCustomTjm: (state): boolean => {
      return Object.keys(state.tjmOverrides).length > 0
    },

    hasCustomDays: (state): boolean => {
      return Object.keys(state.daysOverrides).length > 0
    },
    
    hasAiAnalysis: (state): boolean => {
      return state.aiAnalysis !== null
    },
    
    aiSuggestedAnswers(): Answers | null {
      if (!this.aiAnalysis?.questionnaire) return null
      
      const q = this.aiAnalysis.questionnaire
      const answers: Answers = {}
      
      if (q.projectType?.value) answers.projectType = q.projectType.value
      if (q.dataComplexity?.value) answers.dataComplexity = q.dataComplexity.value
      if (q.multilingual?.value) answers.multilingual = q.multilingual.value
      if (q.integrations?.values) answers.integrations = q.integrations.values
      if (q.accessibility?.value) answers.accessibility = q.accessibility.value
      if (q.security?.value) answers.security = q.security.value
      if (q.deadline?.value) answers.deadline = q.deadline.value
      
      return answers
    },
  },

  actions: {
    async loadTjmProfiles() {
      // Si les profils sont déjà chargés, vérifier la distribution
      if (this.tjmProfiles.length > 0) {
        // Si la distribution est vide, la réinitialiser
        const hasDistribution = Object.keys(this.distribution).length > 0
        if (!hasDistribution) {
          this.tjmProfiles.forEach(profile => {
            this.distribution[profile.id] = profile.default_percentage
          })
        }
        return
      }

      this.isLoadingTjm = true
      this.tjmError = null
      try {
        const { getTjmProfiles } = useDirectus()
        this.tjmProfiles = await getTjmProfiles()

        if (this.tjmProfiles.length === 0) {
          this.tjmError = 'result.tjmError'
          return
        }

        // Initialiser la distribution par défaut
        this.tjmProfiles.forEach(profile => {
          this.distribution[profile.id] = profile.default_percentage
        })
      } catch (error) {
        console.error('Error loading TJM profiles:', error)
        this.tjmError = 'result.tjmError'
      } finally {
        this.isLoadingTjm = false
      }
    },
    
    setAnswer(questionId: string, value: string | string[]) {
      this.answers[questionId] = value
    },
    
    toggleMultiSelectAnswer(questionId: string, value: string) {
      const currentAnswers = (this.answers[questionId] as string[]) || []
      
      if (value === 'none') {
        this.answers[questionId] = ['none']
        return
      }
      
      let newAnswers = currentAnswers.filter((v) => v !== 'none')
      
      if (newAnswers.includes(value)) {
        newAnswers = newAnswers.filter((v) => v !== value)
      } else {
        newAnswers.push(value)
      }
      
      this.answers[questionId] = newAnswers
    },
    
    nextStep() {
      if (this.currentStep < QUESTIONS.length - 1) {
        this.currentStep++
      }
    },
    
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    
    goToStep(step: number) {
      if (step >= 0 && step < QUESTIONS.length) {
        this.currentStep = step
      }
    },
    
    setProjectName(name: string) {
      this.projectName = name
    },
    
    setEstimationType(type: 'quick' | 'detailed') {
      this.estimationType = type
    },
    
    setDistribution(profileId: string, percentage: number) {
      this.distribution[profileId] = percentage
    },
    
    setTjmOverride(profileId: string, tjm: number) {
      const profile = this.tjmProfiles.find(p => p.id === profileId)
      if (profile) {
        if (tjm === profile.tjm) {
          // Si on remet le TJM standard, on supprime l'override
          delete this.tjmOverrides[profileId]
        } else {
          this.tjmOverrides[profileId] = tjm
        }
      }
    },
    
    clearTjmOverride(profileId: string) {
      delete this.tjmOverrides[profileId]
    },
    
    clearAllTjmOverrides() {
      this.tjmOverrides = {}
    },

    setDaysOverride(profileId: string, days: number) {
      if (days > 0) {
        this.daysOverrides[profileId] = days
      } else {
        delete this.daysOverrides[profileId]
      }
    },

    clearDaysOverride(profileId: string) {
      delete this.daysOverrides[profileId]
    },

    clearAllDaysOverrides() {
      this.daysOverrides = {}
    },

    setDiscountType(type: DiscountType) {
      this.discountType = type
      if (type === 'none') {
        this.discountValue = 0
      }
    },
    
    setDiscountValue(value: number) {
      this.discountValue = value
    },
    
    resetDistribution() {
      this.tjmProfiles.forEach(profile => {
        this.distribution[profile.id] = profile.default_percentage
      })
    },
    
    setSavedProjectId(id: string | null) {
      this.savedProjectId = id
    },
    
    reset() {
      this.currentStep = 0
      this.answers = {}
      this.projectName = ''
      this.estimationType = 'quick'
      this.tjmOverrides = {}
      this.daysOverrides = {}
      this.discountType = 'none'
      this.discountValue = 0
      this.savedProjectId = null
      this.projectStatus = 'draft'
      this.uploadedDocuments = []
      this.aiAnalysis = null
      this.isAnalyzing = false
      this.analysisError = null
      this.useAiSuggestions = false
      this.conversationHistory = []
      this.selectedModel = 'claude-sonnet-4-20250514'
      this.isChatting = false
      this.chatError = null
      this.resetDistribution()
    },
    
    // Document upload
    addDocument(doc: UploadedDocument) {
      this.uploadedDocuments.push(doc)
    },
    
    removeDocument(fileId: string) {
      this.uploadedDocuments = this.uploadedDocuments.filter(d => d.id !== fileId)
      if (this.aiAnalysis?.meta?.fileId === fileId) {
        this.aiAnalysis = null
      }
    },
    
    setAiAnalysis(analysis: AIAnalysis) {
      this.aiAnalysis = analysis
      this.analysisError = null
      
      // Pré-remplir le nom du projet si trouvé
      if (analysis.summary?.title && !this.projectName) {
        this.projectName = analysis.summary.title
      }
    },
    
    setAnalyzing(value: boolean) {
      this.isAnalyzing = value
    },
    
    setAnalysisError(error: string | null) {
      this.analysisError = error
    },
    
    applyAiSuggestions() {
      if (!this.aiAnalysis?.questionnaire) return
      
      const q = this.aiAnalysis.questionnaire
      
      if (q.projectType?.value) this.answers.projectType = q.projectType.value
      if (q.dataComplexity?.value) this.answers.dataComplexity = q.dataComplexity.value
      if (q.multilingual?.value) this.answers.multilingual = q.multilingual.value
      if (q.integrations?.values) this.answers.integrations = q.integrations.values
      if (q.accessibility?.value) this.answers.accessibility = q.accessibility.value
      if (q.security?.value) this.answers.security = q.security.value
      if (q.deadline?.value) this.answers.deadline = q.deadline.value
      
      this.useAiSuggestions = true
    },
    
    clearAiSuggestions() {
      this.answers = {}
      this.useAiSuggestions = false
    },
    
    // Chat with Claude
    setSelectedModel(model: ClaudeModel) {
      this.selectedModel = model
    },
    
    addMessage(message: ConversationMessage) {
      this.conversationHistory.push(message)
    },
    
    setChatting(value: boolean) {
      this.isChatting = value
    },
    
    setChatError(error: string | null) {
      this.chatError = error
    },
    
    clearConversation() {
      this.conversationHistory = []
    },
    
    async sendMessage(content: string) {
      const { chatWithClaude } = useDirectus()
      
      // Ajouter le message utilisateur
      const userMessage: ConversationMessage = {
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      }
      this.addMessage(userMessage)
      
      this.setChatting(true)
      this.setChatError(null)
      
      try {
        // Préparer les messages pour l'API (sans timestamp)
        const apiMessages = this.conversationHistory.map(m => ({
          role: m.role,
          content: m.content,
        }))
        
        // System prompt pour garder le contexte de l'estimation
        const systemPrompt = `Tu es un assistant spécialisé dans l'analyse de projets web et l'estimation de charges.
        
${this.aiAnalysis ? `Contexte actuel :
- Projet analysé : ${this.aiAnalysis.summary?.title || 'Non défini'}
- Complexité : ${this.aiAnalysis.complexity?.score}/10
- Stack suggérée : ${this.aiAnalysis.complexity?.suggestedStack}` : 'Aucun document analysé pour le moment.'}

Aide l'utilisateur à affiner son analyse, compléter les informations manquantes, ou répondre à ses questions sur le projet.`
        
        const response = await chatWithClaude(apiMessages, this.selectedModel, systemPrompt)
        
        // Ajouter la réponse de Claude
        const assistantMessage: ConversationMessage = {
          role: 'assistant',
          content: response.content,
          timestamp: new Date().toISOString(),
        }
        this.addMessage(assistantMessage)
        
        return response
      } catch (error: any) {
        this.setChatError(error.message || 'Erreur lors de la conversation')
        throw error
      } finally {
        this.setChatting(false)
      }
    },
    
    async saveProject() {
      if (!this.projectName.trim() || !this.recommendation) {
        return null
      }

      const { calculateDetailedBudget, calculateDiscount } = useEstimation()
      const { createProject, updateProject } = useDirectus()

      const avgDays = Math.round(
        (this.recommendation.days.min + this.recommendation.days.max) / 2
      )
      const budget = calculateDetailedBudget(
        avgDays,
        this.tjmProfiles,
        this.distribution,
        this.tjmOverrides,
        this.daysOverrides
      )

      const { finalBudget } = calculateDiscount(
        budget.total,
        this.discountType,
        this.discountValue
      )

      const projectData = {
        name: this.projectName,
        stack: this.recommendation.stack,
        total_days: avgDays,
        total_budget: budget.total,
        discount_type: this.discountType,
        discount_value: this.discountValue,
        final_budget: finalBudget,
        status: 'draft' as const,
        answers: this.answers,
        budget_breakdown: budget.breakdown,
        documents: this.uploadedDocuments.map(d => d.id),
        ai_analysis: this.aiAnalysis,
        conversation_history: this.conversationHistory.length > 0 ? this.conversationHistory : null,
      }

      let project
      if (this.savedProjectId) {
        project = await updateProject(this.savedProjectId, projectData)
      } else {
        project = await createProject(projectData)
      }

      if (project) {
        this.savedProjectId = project.id
      }

      return project
    },

    async loadProject(projectId: string) {
      const { getProject } = useDirectus()

      try {
        const project = await getProject(projectId)

        if (!project) {
          throw new Error('Project not found')
        }

        // Restaurer l'état complet du projet
        this.projectName = project.name
        this.answers = project.answers || {}
        this.discountType = project.discount_type || 'none'
        this.discountValue = project.discount_value || 0
        this.savedProjectId = project.id
        this.projectStatus = project.status || 'draft'
        this.aiAnalysis = project.ai_analysis || null
        this.conversationHistory = project.conversation_history || []

        // Restaurer la distribution et les TJM personnalisés depuis le breakdown
        if (project.budget_breakdown && project.budget_breakdown.length > 0) {
          // Charger les profils TJM si nécessaire
          await this.loadTjmProfiles()

          // Reconstruire la distribution, days et tjm overrides depuis le breakdown
          this.distribution = {}
          this.tjmOverrides = {}
          this.daysOverrides = {}

          project.budget_breakdown.forEach((item: any) => {
            this.distribution[item.profile_id] = item.percentage

            // Stocker les jours personnalisés
            if (item.days) {
              this.daysOverrides[item.profile_id] = item.days
            }

            // Si le TJM appliqué diffère du TJM standard, c'est un override
            if (item.tjm_applied !== item.tjm_standard) {
              this.tjmOverrides[item.profile_id] = item.tjm_applied
            }
          })
        }

        // Restaurer les documents uploadés si présents
        if (project.documents && Array.isArray(project.documents)) {
          this.uploadedDocuments = project.documents.map((docId: string) => ({
            id: docId,
            filename: `Document ${docId}`, // Le nom exact n'est pas critique pour l'affichage
          }))
        }

        return project
      } catch (error) {
        console.error('Error loading project:', error)
        throw error
      }
    },
  },
})

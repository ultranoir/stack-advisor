// Types pour les stacks
export type StackId = 'A' | 'B' | 'C'

export interface Stack {
  id: StackId
  name: string
  cms: string
  frontend: string
  description: string
  bgColor: string
  borderColor: string
  textColor: string
  badgeClass: string
  infraCost: {
    min: number
    max: number
  }
}

// Types pour les questions
export interface QuestionOption {
  value: string
  label: string
  modifier?: number
  stackModifier?: number
  stack?: StackId
  days?: {
    min: number
    max: number
  }
  note?: string
}

export interface Question {
  id: string
  question: string
  icon: string
  multiSelect?: boolean
  options: QuestionOption[]
}

// Types pour les réponses
export type Answers = Record<string, string | string[]>

// Types pour les recommandations
export interface Recommendation {
  stack: StackId
  days: {
    min: number
    max: number
  }
  modifier: number
}

// Types pour la grille TJM (depuis Directus)
export type ProfileCategory = 'dev' | 'devops' | 'design' | 'management' | 'other'
export type ProfileLevel = 'junior' | 'standard' | 'senior'

export interface TjmProfile {
  id: string
  label: string
  category: ProfileCategory
  level: ProfileLevel
  tjm_standard: number
  default_percentage: number
  sort: number
}

// Types pour la remise commerciale
export type DiscountType = 'none' | 'percentage' | 'fixed'

// Types pour le budget détaillé
export interface BudgetBreakdownItem {
  profile: string
  profile_id: string
  days: number
  tjm_standard: number
  tjm_applied: number
  cost: number
  percentage: number
}

export interface DetailedBudget {
  breakdown: BudgetBreakdownItem[]
  total: number
  totalDays: number
}

// Types pour les projets (Directus)
export interface Project {
  id: string
  name: string
  date_created: string
  date_updated: string
  user_created: string
  stack: StackId
  total_days: number
  total_budget: number
  discount_type: DiscountType
  discount_value: number
  final_budget: number
  status: 'draft' | 'pending' | 'validated'
  answers: Answers
  budget_breakdown: BudgetBreakdownItem[]
  documents: string[] | null
  ai_analysis: AIAnalysis | null
  conversation_history: ConversationMessage[] | null
}

// Types pour le chat avec Claude
export type ClaudeModel = 'claude-opus-4-20250514' | 'claude-sonnet-4-20250514' | 'claude-haiku-4-20250514'

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatResponse {
  content: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
  model: string
}

// Types pour l'analyse Claude AI
export interface AIAnalysisQuestionAnswer {
  value?: string
  values?: string[]
  confidence: number
  reasoning: string
}

export interface AIAnalysisSummary {
  title: string
  client: string
  context: string
  objectives: string[]
  keyFeatures: string[]
  constraints: string[]
  risks: string[]
}

export interface AIAnalysisComplexity {
  score: number
  level: 'low' | 'medium' | 'high' | 'enterprise'
  suggestedStack: StackId
  explanation: string
}

export interface AIAnalysisQuestionnaire {
  projectType: AIAnalysisQuestionAnswer
  dataComplexity: AIAnalysisQuestionAnswer
  multilingual: AIAnalysisQuestionAnswer
  integrations: AIAnalysisQuestionAnswer
  accessibility: AIAnalysisQuestionAnswer
  security: AIAnalysisQuestionAnswer
  deadline: AIAnalysisQuestionAnswer
}

export interface AIAnalysisMeta {
  analyzedAt: string
  fileId: string
  fileName: string
  fileType: string
  textLength: number
  model: string
  tokensUsed: number
}

export interface AIAnalysis {
  summary: AIAnalysisSummary
  questionnaire: AIAnalysisQuestionnaire
  complexity: AIAnalysisComplexity
  missingInfo: string[]
  meta: AIAnalysisMeta
}

// Document uploadé
export interface UploadedDocument {
  id: string
  filename: string
}

// Types pour les utilisateurs
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar: string | null
  role: string
}

// Types pour l'authentification
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

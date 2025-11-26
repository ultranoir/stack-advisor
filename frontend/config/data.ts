import type { Question, StackId } from '~/types'

// Stack configuration (visual properties only, texts are in i18n)
export const STACK_CONFIG: Record<StackId, {
  id: StackId
  bgColor: string
  borderColor: string
  textColor: string
  badgeClass: string
  infraCost: { min: number; max: number }
}> = {
  A: {
    id: 'A',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-800',
    badgeClass: 'badge-stack-a',
    infraCost: { min: 50, max: 300 },
  },
  B: {
    id: 'B',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-800',
    badgeClass: 'badge-stack-b',
    infraCost: { min: 25, max: 80 },
  },
  C: {
    id: 'C',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    textColor: 'text-emerald-800',
    badgeClass: 'badge-stack-c',
    infraCost: { min: 5, max: 30 },
  },
}

// Questionnaire configuration (data only, texts are in i18n)
export const QUESTIONS: Question[] = [
  {
    id: 'projectType',
    question: '', // Will be loaded from i18n
    icon: 'building-2',
    options: [
      { value: 'vitrine', label: '', stack: 'C', days: { min: 8, max: 15 } },
      { value: 'corporate', label: '', stack: 'B', days: { min: 20, max: 35 } },
      { value: 'editorial', label: '', stack: 'A', days: { min: 40, max: 60 } },
      { value: 'webapp', label: '', stack: 'B', days: { min: 25, max: 50 } },
      { value: 'webgl', label: '', stack: 'B', days: { min: 30, max: 60 } },
      { value: 'intranet', label: '', stack: 'A', days: { min: 60, max: 120 } },
      { value: 'internal', label: '', stack: 'C', days: { min: 10, max: 25 } },
    ],
  },
  {
    id: 'dataComplexity',
    question: '',
    icon: 'layers',
    options: [
      { value: 'simple', label: '', modifier: 0, stackModifier: 0 },
      { value: 'medium', label: '', modifier: 0.15, stackModifier: 0 },
      { value: 'complex', label: '', modifier: 0.3, stackModifier: 1 },
      { value: 'enterprise', label: '', modifier: 0.5, stackModifier: 2 },
    ],
  },
  {
    id: 'multilingual',
    question: '',
    icon: 'globe',
    options: [
      { value: 'mono', label: '', modifier: 0, stackModifier: 0 },
      { value: 'bi', label: '', modifier: 0.1, stackModifier: 0 },
      { value: 'multi', label: '', modifier: 0.2, stackModifier: 1 },
      { value: 'enterprise', label: '', modifier: 0.3, stackModifier: 2 },
    ],
  },
  {
    id: 'integrations',
    question: '',
    icon: 'zap',
    multiSelect: true,
    options: [
      { value: 'none', label: '', modifier: 0 },
      { value: 'crm', label: '', modifier: 0.1 },
      { value: 'erp', label: '', modifier: 0.15 },
      { value: 'sso', label: '', modifier: 0.1, stackModifier: 1 },
      { value: 'payment', label: '', modifier: 0.1 },
      { value: 'analytics', label: '', modifier: 0.05 },
      { value: 'search', label: '', modifier: 0.1 },
    ],
  },
  {
    id: 'accessibility',
    question: '',
    icon: 'users',
    options: [
      { value: 'none', label: '', modifier: 0 },
      { value: 'aa', label: '', modifier: 0.15 },
      { value: 'aaa', label: '', modifier: 0.25 },
    ],
  },
  {
    id: 'security',
    question: '',
    icon: 'shield',
    options: [
      { value: 'standard', label: '', modifier: 0, stackModifier: 0 },
      { value: 'enhanced', label: '', modifier: 0.1, stackModifier: 0 },
      { value: 'enterprise', label: '', modifier: 0.2, stackModifier: 1 },
    ],
  },
  {
    id: 'deadline',
    question: '',
    icon: 'clock',
    options: [
      { value: 'urgent', label: '', modifier: 0.2, note: '' },
      { value: 'standard', label: '', modifier: 0 },
      { value: 'comfortable', label: '', modifier: -0.05 },
      { value: 'long', label: '', modifier: -0.1 },
    ],
  },
]

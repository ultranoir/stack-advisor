import type { Stack, Question, StackId } from '~/types'

// Configuration des stacks
export const STACKS: Record<StackId, Stack> = {
  A: {
    id: 'A',
    name: 'Stack A — Enterprise',
    cms: 'Drupal',
    frontend: 'Next.js',
    description: 'Projets complexes, multilingue avancé, workflows enterprise',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-800',
    badgeClass: 'badge-stack-a',
    infraCost: { min: 50, max: 300 },
  },
  B: {
    id: 'B',
    name: 'Stack B — Standard',
    cms: 'Directus',
    frontend: 'Nuxt.js',
    description: 'Sites corporate, WebGL/3D, API-first, projets moyens',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-800',
    badgeClass: 'badge-stack-b',
    infraCost: { min: 25, max: 80 },
  },
  C: {
    id: 'C',
    name: 'Stack C — Léger',
    cms: 'Decap CMS / Directus',
    frontend: 'Nuxt.js SSG / Vite.js',
    description: 'Sites vitrines, apps internes, budget limité',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    textColor: 'text-emerald-800',
    badgeClass: 'badge-stack-c',
    infraCost: { min: 5, max: 30 },
  },
}

// Questions du questionnaire
export const QUESTIONS: Question[] = [
  {
    id: 'projectType',
    question: 'Quelle est la typologie du projet ?',
    icon: 'building-2',
    options: [
      { value: 'vitrine', label: 'Site vitrine (< 15 pages)', stack: 'C', days: { min: 8, max: 15 } },
      { value: 'corporate', label: 'Site corporate (15-50 pages)', stack: 'B', days: { min: 20, max: 35 } },
      { value: 'editorial', label: 'Site éditorial complexe', stack: 'A', days: { min: 40, max: 60 } },
      { value: 'webapp', label: 'Application web / Dashboard', stack: 'B', days: { min: 25, max: 50 } },
      { value: 'webgl', label: 'Expérience WebGL / 3D', stack: 'B', days: { min: 30, max: 60 } },
      { value: 'intranet', label: 'Intranet / Portail enterprise', stack: 'A', days: { min: 60, max: 120 } },
      { value: 'internal', label: 'App interne (sans SEO)', stack: 'C', days: { min: 10, max: 25 } },
    ],
  },
  {
    id: 'dataComplexity',
    question: 'Quelle est la complexité de la structuration des données ?',
    icon: 'layers',
    options: [
      { value: 'simple', label: 'Simple (< 5 types de contenus)', modifier: 0, stackModifier: 0 },
      { value: 'medium', label: 'Moyenne (5-10 types, relations simples)', modifier: 0.15, stackModifier: 0 },
      { value: 'complex', label: 'Complexe (> 10 types, relations multiples)', modifier: 0.3, stackModifier: 1 },
      { value: 'enterprise', label: 'Enterprise (workflows, validations)', modifier: 0.5, stackModifier: 2 },
    ],
  },
  {
    id: 'multilingual',
    question: 'Combien de langues sont prévues ?',
    icon: 'globe',
    options: [
      { value: 'mono', label: 'Monolingue', modifier: 0, stackModifier: 0 },
      { value: 'bi', label: '2-3 langues', modifier: 0.1, stackModifier: 0 },
      { value: 'multi', label: '4-5 langues', modifier: 0.2, stackModifier: 1 },
      { value: 'enterprise', label: '> 5 langues', modifier: 0.3, stackModifier: 2 },
    ],
  },
  {
    id: 'integrations',
    question: 'Quelles intégrations tierces sont nécessaires ?',
    icon: 'zap',
    multiSelect: true,
    options: [
      { value: 'none', label: 'Aucune', modifier: 0 },
      { value: 'crm', label: 'CRM (Salesforce, HubSpot...)', modifier: 0.1 },
      { value: 'erp', label: 'ERP', modifier: 0.15 },
      { value: 'sso', label: 'SSO / LDAP / Active Directory', modifier: 0.1, stackModifier: 1 },
      { value: 'payment', label: 'Paiement en ligne', modifier: 0.1 },
      { value: 'analytics', label: 'Analytics avancé / Data', modifier: 0.05 },
      { value: 'search', label: 'Moteur de recherche (Algolia, Elasticsearch)', modifier: 0.1 },
    ],
  },
  {
    id: 'accessibility',
    question: "Quel niveau d'accessibilité est requis ?",
    icon: 'users',
    options: [
      { value: 'none', label: 'Standard (bonnes pratiques)', modifier: 0 },
      { value: 'aa', label: 'RGAA / WCAG AA', modifier: 0.15 },
      { value: 'aaa', label: 'RGAA / WCAG AAA', modifier: 0.25 },
    ],
  },
  {
    id: 'security',
    question: 'Quelles contraintes sécurité ?',
    icon: 'shield',
    options: [
      { value: 'standard', label: 'Standard', modifier: 0, stackModifier: 0 },
      { value: 'enhanced', label: 'Renforcée (audit sécurité)', modifier: 0.1, stackModifier: 0 },
      { value: 'enterprise', label: 'Enterprise (conformité, certifications)', modifier: 0.2, stackModifier: 1 },
    ],
  },
  {
    id: 'deadline',
    question: 'Quel est le planning prévu ?',
    icon: 'clock',
    options: [
      { value: 'urgent', label: 'Urgent (< 4 semaines)', modifier: 0.2, note: 'Privilégier Stack B ou C' },
      { value: 'standard', label: 'Standard (1-3 mois)', modifier: 0 },
      { value: 'comfortable', label: 'Confortable (3-6 mois)', modifier: -0.05 },
      { value: 'long', label: 'Long terme (> 6 mois)', modifier: -0.1 },
    ],
  },
]

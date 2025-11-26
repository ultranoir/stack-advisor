import { QUESTIONS, STACK_CONFIG } from '~/config/data'
import type { Question, Stack, StackId } from '~/types'

/**
 * Composable pour charger les données avec les traductions i18n
 */
export const useI18nData = () => {
  const { t } = useI18n()

  /**
   * Récupère les questions avec les textes traduits
   */
  const getTranslatedQuestions = (): Question[] => {
    return QUESTIONS.map(q => ({
      ...q,
      question: t(`questions.${q.id}.question`),
      options: q.options.map(opt => ({
        ...opt,
        label: t(`questions.${q.id}.options.${opt.value}.label`),
        note: opt.note !== undefined ? t(`questions.${q.id}.options.${opt.value}.note`) : undefined,
      })),
    }))
  }

  /**
   * Récupère une stack avec les textes traduits
   */
  const getTranslatedStack = (stackId: StackId): Stack => {
    const config = STACK_CONFIG[stackId]
    return {
      ...config,
      name: t(`stacks.${stackId}.name`),
      cms: t(`stacks.${stackId}.cms`),
      frontend: t(`stacks.${stackId}.frontend`),
      description: t(`stacks.${stackId}.description`),
    }
  }

  /**
   * Récupère toutes les stacks avec les textes traduits
   */
  const getTranslatedStacks = (): Record<StackId, Stack> => {
    return {
      A: getTranslatedStack('A'),
      B: getTranslatedStack('B'),
      C: getTranslatedStack('C'),
    }
  }

  return {
    getTranslatedQuestions,
    getTranslatedStack,
    getTranslatedStacks,
  }
}

import type { Answers, Recommendation, DetailedBudget, BudgetBreakdownItem, StackId, TjmProfile, DiscountType } from '~/types'
import { QUESTIONS } from '~/config/data'

export const useEstimation = () => {
  
  /**
   * Calcule la recommandation de stack et l'estimation de jours
   */
  const calculateRecommendation = (answers: Answers): Recommendation => {
    const stackScore = { A: 0, B: 5, C: 0 } // B par défaut
    let baseDays = { min: 20, max: 35 }
    let totalModifier = 0

    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = QUESTIONS.find((q) => q.id === questionId)
      if (!question) return

      if (question.multiSelect && Array.isArray(answer)) {
        answer.forEach((val) => {
          const opt = question.options.find((o) => o.value === val)
          if (opt) {
            totalModifier += opt.modifier || 0
            if (opt.stackModifier) stackScore.A += opt.stackModifier
          }
        })
      } else if (typeof answer === 'string') {
        const opt = question.options.find((o) => o.value === answer)
        if (opt) {
          totalModifier += opt.modifier || 0
          if (opt.stackModifier) stackScore.A += opt.stackModifier
          if (opt.days) baseDays = opt.days
          if (opt.stack) {
            if (opt.stack === 'A') stackScore.A += 3
            else if (opt.stack === 'C') stackScore.C += 3
          }
        }
      }
    })

    // Détermination de la stack
    let recommendedStack: StackId = 'B'
    if (stackScore.A >= 4) recommendedStack = 'A'
    else if (stackScore.C >= 3 && stackScore.A < 2) recommendedStack = 'C'

    // Calcul des jours ajustés
    const adjustedDays = {
      min: Math.round(baseDays.min * (1 + totalModifier)),
      max: Math.round(baseDays.max * (1 + totalModifier)),
    }

    return {
      stack: recommendedStack,
      days: adjustedDays,
      modifier: totalModifier,
    }
  }

  /**
   * Calcule le budget détaillé par profil avec TJM dynamiques
   * @param totalDays - Nombre total de jours (utilisé si pas de daysOverrides)
   * @param tjmProfiles - Profils TJM depuis Directus
   * @param distribution - Répartition personnalisée (optionnel)
   * @param tjmOverrides - TJM modifiés pour ce projet (optionnel)
   * @param daysOverrides - Jours personnalisés par profil (optionnel)
   */
  const calculateDetailedBudget = (
    totalDays: number,
    tjmProfiles: TjmProfile[],
    distribution?: Record<string, number>,
    tjmOverrides?: Record<string, number>,
    daysOverrides?: Record<string, number>
  ): DetailedBudget => {
    const breakdown: BudgetBreakdownItem[] = []
    let total = 0
    let sumDays = 0

    // Filtrer les profils avec une répartition > 0 ou des jours définis
    const activeProfiles = tjmProfiles.filter(profile => {
      // Si des jours sont définis pour ce profil, l'inclure
      if (daysOverrides?.[profile.id]) return true

      // Sinon, vérifier le pourcentage
      const percentage = distribution?.[profile.id] ?? profile.default_percentage
      return percentage > 0
    })

    activeProfiles.forEach((profile) => {
      const percentage = distribution?.[profile.id] ?? profile.default_percentage

      // Utiliser les jours personnalisés si définis, sinon calculer depuis le pourcentage
      const days = daysOverrides?.[profile.id]
        ?? Math.round(totalDays * (percentage / 100) * 10) / 10

      const tjmStandard = profile.tjm
      const tjmApplied = tjmOverrides?.[profile.id] ?? tjmStandard
      const cost = days * tjmApplied

      breakdown.push({
        profile: profile.name,
        profile_id: profile.id,
        days,
        tjm_standard: tjmStandard,
        tjm_applied: tjmApplied,
        cost,
        percentage,
      })

      total += cost
      sumDays += days
    })

    return {
      breakdown,
      total: Math.round(total),
      totalDays: Math.round(sumDays * 10) / 10,
    }
  }

  /**
   * Calcule l'estimation rapide (fourchette)
   */
  const calculateQuickEstimate = (days: { min: number; max: number }, tjmProfiles: TjmProfile[]) => {
    // Calcul du TJM moyen pondéré par défaut
    let totalWeight = 0
    let weightedTjm = 0
    
    tjmProfiles.forEach(profile => {
      if (profile.default_percentage > 0) {
        weightedTjm += profile.tjm * profile.default_percentage
        totalWeight += profile.default_percentage
      }
    })
    
    const averageTjm = totalWeight > 0 ? Math.round(weightedTjm / totalWeight) : 950
    
    return {
      daysMin: days.min,
      daysMax: days.max,
      budgetMin: Math.round(days.min * averageTjm),
      budgetMax: Math.round(days.max * averageTjm),
      averageTjm,
    }
  }

  /**
   * Calcule la remise commerciale
   */
  const calculateDiscount = (
    totalBudget: number,
    discountType: DiscountType,
    discountValue: number
  ): { discountAmount: number; finalBudget: number } => {
    if (discountType === 'none' || !discountValue) {
      return { discountAmount: 0, finalBudget: totalBudget }
    }
    
    let discountAmount = 0
    
    if (discountType === 'percentage') {
      discountAmount = Math.round(totalBudget * (discountValue / 100))
    } else if (discountType === 'fixed') {
      discountAmount = Math.round(discountValue)
    }
    
    const finalBudget = Math.max(0, totalBudget - discountAmount)
    
    return { discountAmount, finalBudget }
  }

  /**
   * Formate un montant en euros
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  /**
   * Formate un montant en K€
   */
  const formatCurrencyK = (amount: number): string => {
    if (amount >= 1000) {
      return `${Math.round(amount / 1000)}k €`
    }
    return formatCurrency(amount)
  }

  return {
    calculateRecommendation,
    calculateDetailedBudget,
    calculateQuickEstimate,
    calculateDiscount,
    formatCurrency,
    formatCurrencyK,
  }
}

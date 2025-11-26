import type { ProfileCategory, ProfileLevel } from '~/types'

export const useProfileHelpers = () => {
  const { t } = useI18n()

  const getCategoryLabel = (category: ProfileCategory): string => {
    const labels: Record<ProfileCategory, string> = {
      dev: t('result.categoryDev'),
      devops: t('result.categoryDevops'),
      design: t('result.categoryDesign'),
      management: t('result.categoryManagement'),
      other: t('result.categoryOther'),
    }
    return labels[category] || category
  }

  const getLevelLabel = (level: ProfileLevel): string => {
    const labels: Record<ProfileLevel, string> = {
      junior: t('result.levelJunior'),
      standard: t('result.levelStandard'),
      senior: t('result.levelSenior'),
    }
    return labels[level] || level
  }

  const getCategoryColor = (category: ProfileCategory): string => {
    const colors: Record<ProfileCategory, string> = {
      dev: 'text-blue-600 bg-blue-50',
      devops: 'text-purple-600 bg-purple-50',
      design: 'text-pink-600 bg-pink-50',
      management: 'text-orange-600 bg-orange-50',
      other: 'text-gray-600 bg-gray-50',
    }
    return colors[category] || 'text-gray-600 bg-gray-50'
  }

  const getLevelBadgeClass = (level: ProfileLevel): string => {
    const classes: Record<ProfileLevel, string> = {
      junior: 'badge-neutral',
      standard: 'badge-info',
      senior: 'badge-warning',
    }
    return classes[level] || 'badge-neutral'
  }

  return {
    getCategoryLabel,
    getLevelLabel,
    getCategoryColor,
    getLevelBadgeClass,
  }
}

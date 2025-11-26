<template>
  <div class="flex-1 p-8 overflow-auto bg-slate-50">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-3xl font-bold text-slate-800">{{ $t('result.title') }}</h2>
          <p class="text-slate-500 mt-1">{{ $t('result.subtitle') }}</p>
        </div>
        <button @click="handleNewEstimation" class="btn-secondary">
          {{ $t('nav.newEstimation') }}
        </button>
      </div>

      <!-- Warning if questionnaire not complete -->
      <div v-if="!store.isComplete" class="card p-6 mb-8 bg-amber-50 border border-amber-300">
        <div class="flex items-center gap-3 mb-3">
          <IconClock class="w-6 h-6 text-amber-600" />
          <h3 class="text-lg font-semibold text-amber-800">{{ $t('result.incompleteQuestionnaire') }}</h3>
        </div>
        <p class="text-amber-700 mb-4">
          {{ $t('result.incompleteMessage') }}
        </p>
        <button @click="navigateTo('/estimation/questionnaire')" class="btn-primary">
          {{ $t('result.completeQuestionnaire') }}
        </button>
      </div>

      <!-- Loading TJM -->
      <div v-if="store.isLoadingTjm" class="card p-8 text-center mb-8">
        <svg class="w-8 h-8 animate-spin mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p class="text-slate-500 mt-4">{{ $t('result.loadingRates') }}</p>
      </div>

      <!-- TJM Error -->
      <div v-else-if="store.tjmError" class="card p-6 mb-8 bg-red-50 border border-red-300">
        <div class="flex items-center gap-3 mb-3">
          <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 class="text-lg font-semibold text-red-800">{{ $t(store.tjmError) }}</h3>
        </div>
        <p class="text-red-700 text-sm">
          {{ $t('result.tjmErrorDescription') }}
        </p>
      </div>

      <template v-else-if="store.isComplete">
        <!-- Stack recommendation -->
        <div
          v-if="recommendation && stack"
          class="rounded-2xl p-6 mb-8 border-2"
          :class="[stack.bgColor, stack.borderColor]"
        >
          <div class="flex items-start justify-between">
            <div>
              <span :class="stack.badgeClass" class="mb-3 inline-block">
                {{ $t('result.recommended') }}
              </span>
              <h3 class="text-2xl font-bold" :class="stack.textColor">
                {{ stack.name }}
              </h3>
              <p class="text-slate-600 mt-2">{{ stack.description }}</p>
              <div class="flex gap-4 mt-4">
                <div class="flex items-center gap-2">
                  <IconBox class="w-4 h-4 text-slate-500" />
                  <span class="text-sm text-slate-600">
                    <strong>{{ $t('result.cms') }} :</strong> {{ stack.cms }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <IconLayers class="w-4 h-4 text-slate-500" />
                  <span class="text-sm text-slate-600">
                    <strong>{{ $t('result.frontend') }} :</strong> {{ stack.frontend }}
                  </span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-slate-500">{{ $t('result.monthlyCost') }}</p>
              <p class="text-lg font-semibold" :class="stack.textColor">
                {{ stack.infraCost.min }} - {{ stack.infraCost.max }} {{ $t('result.perMonth') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Project name & save -->
        <div class="card p-6 mb-6">
          <label class="block text-sm font-medium text-slate-700 mb-2">
            {{ $t('result.projectName') }}
          </label>
          <div class="flex gap-3">
            <input
              v-model="store.projectName"
              type="text"
              :placeholder="$t('result.projectNamePlaceholder')"
              class="input flex-1"
            />
            <button
              @click="handleSave"
              :disabled="!store.projectName.trim() || isSaving"
              class="btn-primary"
            >
              <svg v-if="isSaving" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ store.savedProjectId ? $t('result.updateProject') : $t('common.save') }}
            </button>
          </div>
          <p v-if="saveSuccess" class="text-sm text-green-600 mt-2">
            {{ $t('result.projectSaved') }}
          </p>
        </div>

        <!-- Estimation type toggle -->
        <div class="flex gap-2 mb-6">
          <button
            @click="store.setEstimationType('quick')"
            class="flex-1 py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2"
            :class="
              store.estimationType === 'quick'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
            "
          >
            <IconClock class="w-5 h-5" />
            {{ $t('result.quickEstimation') }}
          </button>
          <button
            @click="store.setEstimationType('detailed')"
            class="flex-1 py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2"
            :class="
              store.estimationType === 'detailed'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
            "
          >
            <IconBarChart class="w-5 h-5" />
            {{ $t('result.detailedBudget') }}
          </button>
        </div>

        <!-- Quick estimation -->
        <div v-if="store.estimationType === 'quick' && quickEstimate" class="card p-6">
          <h4 class="text-lg font-semibold text-slate-800 mb-4">{{ $t('result.quickEstimation') }}</h4>
          <div class="grid grid-cols-2 gap-6">
            <div class="bg-slate-50 rounded-lg p-4">
              <p class="text-sm text-slate-500 mb-1">{{ $t('result.estimatedWorkload') }}</p>
              <p class="text-3xl font-bold text-slate-800">
                {{ quickEstimate.daysMin }} - {{ quickEstimate.daysMax }}
                <span class="text-lg font-normal text-slate-500">{{ $t('result.days') }}</span>
              </p>
            </div>
            <div class="bg-slate-50 rounded-lg p-4">
              <p class="text-sm text-slate-500 mb-1">
                {{ $t('result.estimatedBudget') }} ({{ $t('result.averageDailyRate', { rate: quickEstimate.averageTjm }) }})
              </p>
              <p class="text-3xl font-bold text-slate-800">
                {{ formatCurrencyK(quickEstimate.budgetMin) }} -
                {{ formatCurrencyK(quickEstimate.budgetMax) }}
                <span class="text-lg font-normal text-slate-500">HT</span>
              </p>
            </div>
          </div>
          <p v-if="recommendation && recommendation.modifier !== 0" class="text-sm text-slate-500 mt-4">
            Ajustement appliqué :
            {{ recommendation.modifier > 0 ? '+' : '' }}{{ Math.round(recommendation.modifier * 100) }}%
            (complexité, intégrations, etc.)
          </p>
        </div>

        <!-- Detailed estimation -->
        <div v-if="store.estimationType === 'detailed' && detailedBudget" class="space-y-6">
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-slate-800">{{ $t('result.detailedBudget') }}</h4>
              <div class="flex items-center gap-4">
                <p class="text-sm text-slate-500">Base : {{ avgDays }} jours</p>
                <span v-if="store.hasCustomTjm" class="badge-warning text-xs">
                  TJM personnalisés
                </span>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-slate-200">
                    <th class="text-left py-3 text-sm font-medium text-slate-500">{{ $t('result.profile') }}</th>
                    <th class="text-center py-3 text-sm font-medium text-slate-500 w-20">{{ $t('result.percentage') }}</th>
                    <th class="text-right py-3 text-sm font-medium text-slate-500">{{ $t('result.days') }}</th>
                    <th class="text-right py-3 text-sm font-medium text-slate-500 w-28">
                      {{ $t('result.dailyRate') }}
                      <span class="text-xs text-slate-400 block">{{ $t('result.standardApplied') }}</span>
                    </th>
                    <th class="text-right py-3 text-sm font-medium text-slate-500">{{ $t('result.total') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in detailedBudget.breakdown"
                    :key="item.profile_id"
                    class="border-b border-slate-100"
                  >
                    <td class="py-3 text-sm text-slate-700">{{ item.profile }}</td>
                    <td class="py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        :value="item.percentage"
                        @input="handleDistributionChange(item.profile_id, $event)"
                        class="w-16 px-2 py-1 text-center text-sm border border-slate-300 rounded"
                      />
                    </td>
                    <td class="py-3 text-right text-sm text-slate-600">{{ item.days }}</td>
                    <td class="py-3 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <span 
                          v-if="item.tjm_applied !== item.tjm_standard" 
                          class="text-xs text-slate-400 line-through"
                        >
                          {{ item.tjm_standard }}€
                        </span>
                        <input
                          type="number"
                          min="0"
                          :value="item.tjm_applied"
                          @input="handleTjmChange(item.profile_id, $event)"
                          class="w-20 px-2 py-1 text-right text-sm border rounded"
                          :class="item.tjm_applied !== item.tjm_standard 
                            ? 'border-amber-300 bg-amber-50' 
                            : 'border-slate-300'"
                        />
                      </div>
                    </td>
                    <td class="py-3 text-right text-sm font-medium text-slate-800">
                      {{ formatCurrency(item.cost) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="bg-slate-50">
                    <td class="py-3 text-sm font-semibold text-slate-800" colspan="2">
                      {{ $t('result.subtotal') }}
                    </td>
                    <td class="py-3 text-right text-sm font-semibold text-slate-800">
                      {{ detailedBudget.totalDays }} j
                    </td>
                    <td class="py-3"></td>
                    <td class="py-3 text-right text-lg font-bold text-slate-800">
                      {{ formatCurrency(detailedBudget.total) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
              <div class="flex gap-2">
                <button @click="store.resetDistribution" class="btn-ghost text-sm">
                  {{ $t('result.resetPercentages') }}
                </button>
                <button 
                  v-if="store.hasCustomTjm"
                  @click="store.clearAllTjmOverrides" 
                  class="btn-ghost text-sm"
                >
                  {{ $t('result.resetRates') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Discount section -->
          <div class="card p-6">
            <h4 class="text-lg font-semibold text-slate-800 mb-4">{{ $t('result.commercialDiscount') }}</h4>
            
            <div class="flex items-center gap-4 mb-4">
              <div class="flex gap-2">
                <button
                  @click="store.setDiscountType('none')"
                  class="px-3 py-2 text-sm rounded-lg transition"
                  :class="store.discountType === 'none' 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                >
                  {{ $t('result.noDiscount') }}
                </button>
                <button
                  @click="store.setDiscountType('percentage')"
                  class="px-3 py-2 text-sm rounded-lg transition"
                  :class="store.discountType === 'percentage'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                >
                  {{ $t('result.percentageDiscount') }}
                </button>
                <button
                  @click="store.setDiscountType('fixed')"
                  class="px-3 py-2 text-sm rounded-lg transition"
                  :class="store.discountType === 'fixed'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                >
                  {{ $t('result.fixedDiscount') }}
                </button>
              </div>

              <div v-if="store.discountType !== 'none'" class="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  :max="store.discountType === 'percentage' ? 100 : undefined"
                  v-model.number="store.discountValue"
                  class="w-24 px-3 py-2 text-right border border-slate-300 rounded-lg"
                />
                <span class="text-slate-600">
                  {{ store.discountType === 'percentage' ? '%' : '€' }}
                </span>
              </div>
            </div>

            <!-- Final total -->
            <div class="bg-slate-50 rounded-lg p-4">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-sm text-slate-500">{{ $t('result.budgetBeforeDiscount') }}</p>
                  <p class="text-lg text-slate-600">{{ formatCurrency(detailedBudget.total) }}</p>
                </div>
                <div v-if="discountResult.discountAmount > 0" class="text-center">
                  <p class="text-sm text-slate-500">{{ $t('result.discount') }}</p>
                  <p class="text-lg text-green-600">- {{ formatCurrency(discountResult.discountAmount) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-slate-500">{{ $t('result.finalBudget') }}</p>
                  <p class="text-2xl font-bold text-blue-600">
                    {{ formatCurrency(discountResult.finalBudget) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Export -->
          <div class="flex justify-end">
            <button @click="exportPDF" class="btn-secondary">
              <IconDownload class="w-4 h-4" />
              {{ $t('result.exportPDF') }}
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { STACK_CONFIG } from '~/config/data'

definePageMeta({
  middleware: 'auth',
})

const store = useEstimationStore()
const { calculateQuickEstimate, calculateDetailedBudget, calculateDiscount, formatCurrency, formatCurrencyK } =
  useEstimation()
const { t } = useI18n()
const { getTranslatedStack } = useI18nData()

const isSaving = ref(false)
const saveSuccess = ref(false)

// Load TJM profiles on mount (no redirect to allow showing incomplete state message)
onMounted(async () => {
  await store.loadTjmProfiles()
})

const recommendation = computed(() => store.recommendation)
const stack = computed(() => {
  if (!recommendation.value) return null
  return {
    ...STACK_CONFIG[recommendation.value.stack],
    ...getTranslatedStack(recommendation.value.stack)
  }
})

const avgDays = computed(() => {
  if (!recommendation.value) return 0
  return Math.round((recommendation.value.days.min + recommendation.value.days.max) / 2)
})

const quickEstimate = computed(() => {
  if (!recommendation.value || store.tjmProfiles.length === 0) return null
  return calculateQuickEstimate(recommendation.value.days, store.tjmProfiles)
})

const detailedBudget = computed(() => {
  if (!recommendation.value || store.tjmProfiles.length === 0) return null
  return calculateDetailedBudget(
    avgDays.value, 
    store.tjmProfiles, 
    store.distribution,
    store.tjmOverrides
  )
})

const discountResult = computed(() => {
  if (!detailedBudget.value) return { discountAmount: 0, finalBudget: 0 }
  return calculateDiscount(
    detailedBudget.value.total,
    store.discountType,
    store.discountValue
  )
})

const handleDistributionChange = (profileId: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseFloat(target.value) || 0
  store.setDistribution(profileId, value)
}

const handleTjmChange = (profileId: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value) || 0
  store.setTjmOverride(profileId, value)
}

const handleNewEstimation = () => {
  store.reset()
  navigateTo('/estimation')
}

const handleSave = async () => {
  isSaving.value = true
  saveSuccess.value = false

  try {
    const project = await store.saveProject()
    if (project) {
      saveSuccess.value = true
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    }
  } catch (error) {
    console.error('Error saving project:', error)
  } finally {
    isSaving.value = false
  }
}

const exportPDF = () => {
  // TODO: Implement PDF export
  alert(t('result.exportPDFNotImplemented'))
}
</script>

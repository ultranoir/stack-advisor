<template>
  <div class="card p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
        <IconBrain class="w-5 h-5 text-blue-600" />
        {{ $t('chat.title') }}
      </h3>
      
      <!-- Model selector -->
      <select
        v-model="store.selectedModel"
        class="px-3 py-2 border border-slate-300 rounded-lg text-sm"
        :disabled="store.isChatting"
      >
        <option value="claude-haiku-4-20250514">{{ $t('estimation.modelHaiku') }}</option>
        <option value="claude-sonnet-4-20250514">{{ $t('estimation.modelSonnet') }}</option>
        <option value="claude-opus-4-20250514">{{ $t('estimation.modelOpus') }}</option>
      </select>
    </div>

    <!-- Messages -->
    <div 
      ref="messagesContainer"
      class="h-96 overflow-y-auto mb-4 space-y-4 p-4 bg-slate-50 rounded-lg"
    >
      <div v-if="store.conversationHistory.length === 0" class="text-center text-slate-400 py-8">
        <IconBrain class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>{{ $t('chat.emptyState') }}</p>
        <p class="text-sm mt-1">{{ $t('chat.emptyStateExample') }}</p>
      </div>

      <div
        v-for="(message, index) in store.conversationHistory"
        :key="index"
        class="flex"
        :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[80%] rounded-lg p-3"
          :class="message.role === 'user' 
            ? 'bg-blue-600 text-white' 
            : 'bg-white border border-slate-200 text-slate-800'"
        >
          <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
          <span class="text-xs opacity-70 mt-1 block">
            {{ formatTime(message.timestamp) }}
          </span>
        </div>
      </div>

      <!-- Loading indicator -->
      <div v-if="store.isChatting" class="flex justify-start">
        <div class="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-2">
          <svg class="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span class="text-sm text-slate-600">{{ $t('chat.thinking') }}</span>
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="store.chatError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      {{ store.chatError }}
    </div>

    <!-- Input -->
    <form @submit.prevent="sendMessage" class="flex gap-2">
      <input
        v-model="messageInput"
        type="text"
        :placeholder="$t('chat.placeholder')"
        class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        :disabled="store.isChatting"
      />
      <button
        type="submit"
        :disabled="!messageInput.trim() || store.isChatting"
        class="btn-primary"
      >
        <IconSend class="w-4 h-4" />
        {{ store.isChatting ? $t('chat.sending') : $t('chat.send') }}
      </button>
    </form>

    <!-- Actions -->
    <div class="flex justify-between mt-4 pt-4 border-t border-slate-200">
      <button
        v-if="store.conversationHistory.length > 0"
        @click="store.clearConversation()"
        class="btn-ghost text-sm"
        :disabled="store.isChatting"
      >
        {{ $t('chat.clearConversation') }}
      </button>
      <span v-else></span>
      
      <span class="text-xs text-slate-400">
        {{ $t('chat.messagesCount', { count: store.conversationHistory.length }) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const store = useEstimationStore()
const { locale } = useI18n()
const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const sendMessage = async () => {
  if (!messageInput.value.trim()) return
  
  try {
    await store.sendMessage(messageInput.value)
    messageInput.value = ''
    
    // Scroll to bottom
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

const formatTime = (timestamp: string) => {
  const localeCode = locale.value === 'en' ? 'en-US' : 'fr-FR'
  return new Date(timestamp).toLocaleTimeString(localeCode, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Auto-scroll on new messages
watch(
  () => store.conversationHistory.length,
  () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }
)
</script>

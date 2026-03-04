<template>
  <Transition name="fade-slide">
    <div v-if="message" 
         class="fixed top-4 right-4 z-50 max-w-md animate-slide-in-right">
      <div class="bg-white rounded-xl shadow-2xl border-l-4 border-green-500 overflow-hidden">
        <div class="flex items-center p-4">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span class="text-green-500 text-xl">✅</span>
            </div>
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium text-gray-900">Success</p>
            <p class="text-sm text-gray-500">{{ message }}</p>
          </div>
          <button @click="$emit('close')" class="ml-4 text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
        <div class="h-1 bg-green-500 animate-progress"></div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    required: true
  }
})

defineEmits(['close'])
</script>

<style scoped>
@keyframes progress {
  from { width: 100%; }
  to { width: 0%; }
}

.animate-progress {
  animation: progress 3s linear forwards;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
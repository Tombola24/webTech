<template>
  <div class="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl p-8 shadow-2xl text-center animate-scale-in">
      <div class="relative">
        <div class="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-2xl animate-bounce">🗳️</span>
        </div>
      </div>
      <p class="mt-4 text-gray-700 font-medium">{{ message }}</p>
      <p class="text-sm text-gray-500 mt-2">Please wait...</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'Loading...'
  }
})
</script>
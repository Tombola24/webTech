<template>
  <div id="app">
    <!-- Loading Spinner -->
    <LoadingSpinner v-if="ui.loading" />
    
    <!-- Error Alert -->
    <Transition name="fade">
      <div v-if="ui.error" class="fixed top-4 right-4 z-50 max-w-md">
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg">
          <div class="flex items-center">
            <span class="text-red-500 text-xl mr-3">⚠️</span>
            <p class="text-red-700 flex-1">{{ ui.error }}</p>
            <button @click="ui.clearError" class="text-red-400 hover:text-red-600">
              ✕
            </button>
          </div>
        </div>
      </div>
    </Transition>
    
    <!-- Success Alert -->
    <Transition name="fade">
      <div v-if="ui.success" class="fixed top-4 right-4 z-50 max-w-md">
        <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-lg">
          <div class="flex items-center">
            <span class="text-green-500 text-xl mr-3">✅</span>
            <p class="text-green-700 flex-1">{{ ui.success }}</p>
            <button @click="ui.clearSuccess" class="text-green-400 hover:text-green-600">
              ✕
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Router View -->
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useElectionStore } from '/src/stores/election.js'
import { useUIStore } from '/src/stores/ui.js'
import LoadingSpinner from '/src/components/common/LoadingSpinner.vue'

const election = useElectionStore()
const ui = useUIStore()

onMounted(() => {
  // Initialize election data when app starts
  console.log('🚀 App mounted, initializing election data...')
  election.init()
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
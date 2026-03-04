<template>
  <div class="space-y-8">
    <h1 class="text-3xl font-bold text-gray-800">🗳️ Candidate Management</h1>

    <!-- Add Candidate Form -->
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span class="text-2xl mr-3">📝</span> Add New Candidate
      </h2>

      <form @submit.prevent="addCandidate" class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Candidate Name</label>
          <input v-model="newCandidate.name" type="text" required
                 class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                 placeholder="Enter candidate name">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Party</label>
          <input v-model="newCandidate.party" type="text" required
                 class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                 placeholder="Enter party name">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Position</label>
          <select v-model="newCandidate.position" required
                  class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500">
            <option value="">Select position</option>
            <option v-for="position in election.positions" :key="position" :value="position">
              {{ position }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Image/Icon</label>
          <input v-model="newCandidate.image" type="text"
                 class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                 placeholder="Emoji or icon (e.g., 👩‍💼)">
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea v-model="newCandidate.description" rows="2"
                    class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Brief description"></textarea>
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Manifesto</label>
          <textarea v-model="newCandidate.manifesto" rows="3"
                    class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Candidate's manifesto / promises"></textarea>
        </div>

        <div class="md:col-span-2 flex gap-4">
          <button type="submit" :disabled="loading"
                  class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 
                         transition-colors disabled:opacity-50 flex items-center space-x-2">
            <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>➕ Add Candidate</span>
          </button>
          <button type="button" @click="clearForm"
                  class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            🧹 Clear
          </button>
        </div>
      </form>
    </div>

    <!-- Search and Filter -->
    <div class="bg-white rounded-xl shadow-lg p-6">
      <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="w-full md:w-64">
          <input v-model="searchTerm" type="text" placeholder="Search by name or party..."
                 class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500">
        </div>
        <select v-model="filterPosition" class="px-4 py-2 border-2 border-gray-200 rounded-lg">
          <option value="all">All Positions</option>
          <option v-for="position in election.positions" :key="position" :value="position">
            {{ position }}
          </option>
        </select>
      </div>
    </div>

    <!-- Candidates by Position -->
    <div v-for="position in filteredPositions" :key="position" class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-xl font-bold text-purple-600 mb-6">{{ position }}</h2>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="candidate in getCandidatesForPosition(position)" :key="candidate.id"
             class="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-500 transition-all">
          
          <!-- Candidate Header -->
          <div class="flex items-center space-x-4 mb-4">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full 
                        flex items-center justify-center text-white text-3xl">
              {{ candidate.image || candidate.name.charAt(0) }}
            </div>
            <div>
              <h3 class="font-bold text-lg">{{ candidate.name }}</h3>
              <p class="text-sm text-gray-600">{{ candidate.party }}</p>
            </div>
          </div>

          <!-- Details -->
          <p class="text-sm text-gray-600 mb-3">{{ candidate.description }}</p>
          <p class="text-xs text-gray-500 italic mb-4">"{{ candidate.manifesto }}"</p>

          <!-- Stats -->
          <div class="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-600">Votes received:</span>
            <span class="font-bold text-green-600">{{ getVoteCount(candidate.id) }}</span>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button @click="editCandidate(candidate)"
                    class="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              ✏️ Edit
            </button>
            <button @click="confirmDelete(candidate)"
                    :disabled="hasVotes(candidate.id)"
                    class="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm
                           disabled:opacity-50 disabled:cursor-not-allowed"
                    :title="hasVotes(candidate.id) ? 'Cannot delete candidate with votes' : ''">
              🗑️ Delete
            </button>
          </div>
        </div>

        <!-- Add Candidate Card -->
        <div @click="setPositionForNew(position)"
             class="border-2 border-dashed border-gray-300 rounded-xl p-6 
                    hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer
                    flex flex-col items-center justify-center min-h-[300px]">
          <span class="text-4xl mb-4">➕</span>
          <span class="font-medium text-gray-600">Add Candidate for {{ position }}</span>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="editingCandidate" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
              <h3 class="text-2xl font-bold text-white">✏️ Edit Candidate</h3>
            </div>

            <!-- Modal Body -->
            <div class="p-8">
              <form @submit.prevent="updateCandidate" class="space-y-6">
                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input v-model="editingCandidate.name" type="text" required
                           class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Party</label>
                    <input v-model="editingCandidate.party" type="text" required
                           class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <select v-model="editingCandidate.position" required
                            class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg">
                      <option v-for="p in election.positions" :key="p" :value="p">{{ p }}</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Image</label>
                    <input v-model="editingCandidate.image" type="text"
                           class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg">
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea v-model="editingCandidate.description" rows="2"
                              class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"></textarea>
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Manifesto</label>
                    <textarea v-model="editingCandidate.manifesto" rows="3"
                              class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"></textarea>
                  </div>
                </div>

                <div class="flex gap-4 justify-end pt-6 border-t border-gray-200">
                  <button type="button" @click="editingCandidate = null"
                          class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                    Cancel
                  </button>
                  <button type="submit" :disabled="updateLoading"
                          class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 
                                 disabled:opacity-50 flex items-center space-x-2">
                    <span v-if="updateLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>💾 Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useElectionStore } from '/src/stores/election.js'
import { useUIStore } from '/src/stores/ui.js'

const election = useElectionStore()
const ui = useUIStore()

const searchTerm = ref('')
const filterPosition = ref('all')
const loading = ref(false)
const updateLoading = ref(false)
const editingCandidate = ref(null)

const newCandidate = reactive({
  name: '',
  party: '',
  position: '',
  description: '',
  manifesto: '',
  image: ''
})

const filteredPositions = computed(() => {
  if (filterPosition.value === 'all') {
    return election.positions || []
  }
  return [filterPosition.value]
})

const getCandidatesForPosition = (position) => {
  let candidates = election.candidates?.filter(c => c.position === position) || []
  
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    candidates = candidates.filter(c => 
      c.name?.toLowerCase().includes(term) ||
      c.party?.toLowerCase().includes(term)
    )
  }
  
  return candidates
}

const getVoteCount = (candidateId) => {
  return election.votes?.filter(v => v.candidateId === candidateId).length || 0
}

const hasVotes = (candidateId) => {
  return election.votes?.some(v => v.candidateId === candidateId) || false
}

const setPositionForNew = (position) => {
  newCandidate.position = position
  // Scroll to form
  document.querySelector('.add-candidate-form')?.scrollIntoView({ behavior: 'smooth' })
}

const addCandidate = async () => {
  if (!newCandidate.name || !newCandidate.party || !newCandidate.position) {
    ui.showError('Please fill in required fields')
    return
  }

  loading.value = true
  const result = await election.addCandidate({ ...newCandidate })
  loading.value = false
  
  if (result.success) {
    clearForm()
    await election.loadCandidates()
  }
}

const editCandidate = (candidate) => {
  editingCandidate.value = { ...candidate }
}

const updateCandidate = async () => {
  if (!editingCandidate.value) return
  
  updateLoading.value = true
  const result = await election.updateCandidate(editingCandidate.value.id, editingCandidate.value)
  updateLoading.value = false
  
  if (result.success) {
    editingCandidate.value = null
    await election.loadCandidates()
  }
}

const confirmDelete = async (candidate) => {
  if (hasVotes(candidate.id)) {
    ui.showError('Cannot delete candidate with existing votes')
    return
  }

  if (confirm(`Are you sure you want to delete ${candidate.name}?`)) {
    await election.deleteCandidate(candidate.id)
    await election.loadCandidates()
  }
}

const clearForm = () => {
  newCandidate.name = ''
  newCandidate.party = ''
  newCandidate.position = ''
  newCandidate.description = ''
  newCandidate.manifesto = ''
  newCandidate.image = ''
}

onMounted(() => {
  if (!election.candidates || election.candidates.length === 0) {
    election.loadCandidates()
  }
})
</script>
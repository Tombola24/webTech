<template>
  <div class="space-y-8">
    <h1 class="text-3xl font-bold text-gray-800">👥 Voter Management</h1>

    <!-- Add Voter Form -->
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span class="text-2xl mr-3">📝</span> Register New Voter
      </h2>

      <form @submit.prevent="addVoter" class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input v-model="newVoter.fullName" type="text" required
                 class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                 placeholder="Enter full name">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input v-model="newVoter.email" type="email" required
                 class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                 placeholder="Enter email">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input v-model="newVoter.password" type="password" required minlength="6"
                 class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                 placeholder="Enter password">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Region</label>
          <select v-model="newVoter.region" required
                  class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500">
            <option value="">Select region</option>
            <option value="Kigali">Kigali</option>
            <option value="Eastern Province">Eastern Province</option>
            <option value="Western Province">Western Province</option>
            <option value="Northern Province">Northern Province</option>
            <option value="Southern Province">Southern Province</option>
          </select>
        </div>

        <div class="md:col-span-2 flex gap-4">
          <button type="submit" :disabled="loading"
                  class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 
                         transition-colors disabled:opacity-50 flex items-center space-x-2">
            <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>➕ Add Voter</span>
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
          <input v-model="searchTerm" type="text" placeholder="Search by name or email..."
                 class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500">
        </div>
        <div class="flex gap-2">
          <select v-model="filterStatus" class="px-4 py-2 border-2 border-gray-200 rounded-lg">
            <option value="all">All Voters</option>
            <option value="voted">Voted</option>
            <option value="not-voted">Not Voted</option>
          </select>
          <select v-model="filterRegion" class="px-4 py-2 border-2 border-gray-200 rounded-lg">
            <option value="all">All Regions</option>
            <option value="Kigali">Kigali</option>
            <option value="Eastern Province">Eastern</option>
            <option value="Western Province">Western</option>
            <option value="Northern Province">Northern</option>
            <option value="Southern Province">Southern</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Voter List -->
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-6">📋 Registered Voters</h2>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voted For</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="voter in paginatedVoters" :key="voter.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm">{{ voter.id }}</td>
              <td class="px-6 py-4 text-sm font-medium">{{ voter.fullName }}</td>
              <td class="px-6 py-4 text-sm">{{ voter.email }}</td>
              <td class="px-6 py-4 text-sm">{{ voter.region || 'N/A' }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="['px-2 py-1 rounded-full text-xs',
                              voter.hasVoted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800']">
                  {{ voter.hasVoted ? '✅ Voted' : '⏳ Not Voted' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <span v-if="voter.hasVoted" class="text-green-600">
                  {{ getVotedPositions(voter.id) }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 text-sm">{{ voter.registrationDate || 'N/A' }}</td>
              <td class="px-6 py-4 text-sm">
                <div class="flex space-x-2">
                  <button @click="editVoter(voter)" 
                          class="text-blue-600 hover:text-blue-800"
                          :disabled="voter.hasVoted"
                          :title="voter.hasVoted ? 'Cannot edit voter who has voted' : ''">
                    ✏️ Edit
                  </button>
                  <button @click="confirmDelete(voter)" 
                          :disabled="voter.hasVoted"
                          class="text-red-600 hover:text-red-800 disabled:opacity-50"
                          :title="voter.hasVoted ? 'Cannot delete voter who has voted' : ''">
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedVoters.length === 0">
              <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                No voters found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="mt-6 flex items-center justify-between">
        <div class="text-sm text-gray-500">
          Showing {{ paginationStart }} to {{ paginationEnd }} of {{ filteredVoters.length }} voters
        </div>
        <div class="flex space-x-2">
          <button @click="prevPage" :disabled="currentPage === 1"
                  class="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50">
            Previous
          </button>
          <span class="px-4 py-2">Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages"
                  class="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50">
            Next
          </button>
        </div>
      </div>

      <!-- Summary -->
      <div class="mt-6 p-4 bg-purple-50 rounded-lg">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <span class="block text-2xl font-bold text-purple-600">{{ election.voters.length }}</span>
            <span class="text-sm text-gray-600">Total Voters</span>
          </div>
          <div>
            <span class="block text-2xl font-bold text-green-600">
              {{ election.voters.filter(v => v.hasVoted).length }}
            </span>
            <span class="text-sm text-gray-600">Voted</span>
          </div>
          <div>
            <span class="block text-2xl font-bold text-yellow-600">
              {{ election.voters.filter(v => !v.hasVoted).length }}
            </span>
            <span class="text-sm text-gray-600">Not Voted</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Voter Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="editingVoter" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl max-w-md w-full p-8">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">✏️ Edit Voter</h3>
            
            <form @submit.prevent="updateVoter" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input v-model="editingVoter.fullName" type="text" required
                       class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input v-model="editingVoter.email" type="email" required
                       class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Region</label>
                <select v-model="editingVoter.region" required
                        class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500">
                  <option value="Kigali">Kigali</option>
                  <option value="Eastern Province">Eastern Province</option>
                  <option value="Western Province">Western Province</option>
                  <option value="Northern Province">Northern Province</option>
                  <option value="Southern Province">Southern Province</option>
                </select>
              </div>

              <div class="flex gap-4 pt-4">
                <button type="submit" :disabled="updateLoading"
                        class="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  💾 Save Changes
                </button>
                <button type="button" @click="editingVoter = null"
                        class="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  Cancel
                </button>
              </div>
            </form>
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
const filterStatus = ref('all')
const filterRegion = ref('all')
const loading = ref(false)
const updateLoading = ref(false)
const editingVoter = ref(null)

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

const newVoter = reactive({
  fullName: '',
  email: '',
  password: '',
  region: ''
})

const filteredVoters = computed(() => {
  let voters = election.voters || []

  // Search filter
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    voters = voters.filter(v => 
      v.fullName?.toLowerCase().includes(term) ||
      v.email?.toLowerCase().includes(term)
    )
  }

  // Status filter
  if (filterStatus.value === 'voted') {
    voters = voters.filter(v => v.hasVoted)
  } else if (filterStatus.value === 'not-voted') {
    voters = voters.filter(v => !v.hasVoted)
  }

  // Region filter
  if (filterRegion.value !== 'all') {
    voters = voters.filter(v => v.region === filterRegion.value)
  }

  return voters
})

const totalPages = computed(() => 
  Math.ceil(filteredVoters.value.length / itemsPerPage)
)

const paginationStart = computed(() => 
  (currentPage.value - 1) * itemsPerPage + 1
)

const paginationEnd = computed(() => 
  Math.min(currentPage.value * itemsPerPage, filteredVoters.value.length)
)

const paginatedVoters = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredVoters.value.slice(start, end)
})

const getVotedPositions = (voterId) => {
  const votes = election.votes.filter(v => v.voterId === voterId)
  return votes.map(v => v.position).join(', ') || 'No votes'
}

const addVoter = async () => {
  if (!newVoter.fullName || !newVoter.email || !newVoter.password) {
    ui.showError('Please fill in all fields')
    return
  }

  if (newVoter.password.length < 6) {
    ui.showError('Password must be at least 6 characters')
    return
  }

  loading.value = true
  const result = await election.addVoter({ ...newVoter })
  loading.value = false
  
  if (result.success) {
    clearForm()
    await election.loadVoters()
  }
}

const editVoter = (voter) => {
  if (voter.hasVoted) {
    ui.showError('Cannot edit voter who has already voted')
    return
  }
  editingVoter.value = { ...voter }
}

const updateVoter = async () => {
  if (!editingVoter.value) return
  
  updateLoading.value = true
  const result = await election.updateVoter(editingVoter.value.id, editingVoter.value)
  updateLoading.value = false
  
  if (result.success) {
    editingVoter.value = null
    await election.loadVoters()
  }
}

const confirmDelete = async (voter) => {
  if (voter.hasVoted) {
    ui.showError('Cannot delete voter who has already voted')
    return
  }

  if (confirm(`Are you sure you want to delete ${voter.fullName}?`)) {
    await election.deleteVoter(voter.id)
    await election.loadVoters()
  }
}

const clearForm = () => {
  newVoter.fullName = ''
  newVoter.email = ''
  newVoter.password = ''
  newVoter.region = ''
  currentPage.value = 1
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

onMounted(() => {
  if (!election.voters || election.voters.length === 0) {
    election.loadVoters()
  }
})
</script>
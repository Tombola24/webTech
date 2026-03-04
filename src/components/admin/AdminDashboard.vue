<template>
  <div class="space-y-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">Loading dashboard data...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
      <p class="text-red-700">{{ error }}</p>
      <button @click="loadData" class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
        Retry
      </button>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Welcome Banner -->
      <div class="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
        <h1 class="text-3xl font-bold mb-2">Welcome, {{ auth.user?.fullName || 'Admin' }}!</h1>
        <p class="text-purple-100">Manage your election system from this dashboard</p>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-blue-100 rounded-lg">
              <span class="text-2xl">👥</span>
            </div>
            <span class="text-3xl font-bold text-blue-600">{{ stats.totalVoters || 0 }}</span>
          </div>
          <h3 class="text-gray-600 font-medium">Total Voters</h3>
          <p class="text-sm text-gray-400 mt-1">{{ stats.votersNotVoted || 0 }} haven't voted</p>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-green-100 rounded-lg">
              <span class="text-2xl">🗳️</span>
            </div>
            <span class="text-3xl font-bold text-green-600">{{ stats.votersVoted || 0 }}</span>
          </div>
          <h3 class="text-gray-600 font-medium">Votes Cast</h3>
          <p class="text-sm text-gray-400 mt-1">{{ stats.turnoutPercentage || 0 }}% turnout</p>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-purple-100 rounded-lg">
              <span class="text-2xl">🏆</span>
            </div>
            <span class="text-3xl font-bold text-purple-600">{{ stats.totalCandidates || 0 }}</span>
          </div>
          <h3 class="text-gray-600 font-medium">Candidates</h3>
          <p class="text-sm text-gray-400 mt-1">Across {{ election.positions?.length || 0 }} positions</p>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-yellow-100 rounded-lg">
              <span class="text-2xl">📊</span>
            </div>
            <span class="text-3xl font-bold text-yellow-600">{{ stats.totalVotes || 0 }}</span>
          </div>
          <h3 class="text-gray-600 font-medium">Total Votes</h3>
          <p class="text-sm text-gray-400 mt-1">{{ getLeadingCandidate() || 'No votes' }} leading</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <span class="text-2xl mr-3">⚡</span> Quick Actions
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button @click="$router.push('/admin/voters')" 
                  class="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 
                         transition-all group">
            <span class="block text-4xl mb-3 group-hover:scale-110 transition-transform">👥</span>
            <span class="font-medium">Manage Voters</span>
          </button>
          
          <button @click="$router.push('/admin/candidates')" 
                  class="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 
                         transition-all group">
            <span class="block text-4xl mb-3 group-hover:scale-110 transition-transform">🗳️</span>
            <span class="font-medium">Manage Candidates</span>
          </button>
          
          <button @click="$router.push('/admin/results')" 
                  class="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 
                         transition-all group">
            <span class="block text-4xl mb-3 group-hover:scale-110 transition-transform">📊</span>
            <span class="font-medium">View Results</span>
          </button>
          
          <button @click="showResetModal = true" 
                  class="p-6 border-2 border-red-200 rounded-xl hover:border-red-500 hover:bg-red-50 
                         transition-all group">
            <span class="block text-4xl mb-3 group-hover:scale-110 transition-transform">🔄</span>
            <span class="font-medium text-red-600">Reset Election</span>
          </button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <span class="text-2xl mr-3">📋</span> Recent Votes
        </h2>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voter</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="vote in recentVotes" :key="vote.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm">{{ vote.voterName }}</td>
                <td class="px-6 py-4 text-sm font-medium text-green-600">{{ vote.candidateName }}</td>
                <td class="px-6 py-4 text-sm">{{ vote.position }}</td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(vote.timestamp) }}</td>
              </tr>
              <tr v-if="recentVotes.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                  No votes have been cast yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Results Preview -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <span class="text-2xl mr-3">🏆</span> Current Leaders
        </h2>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="(result, position) in election.detailedResults || {}" :key="position" 
               class="border border-gray-200 rounded-xl p-4">
            <h3 class="font-bold text-purple-600 mb-3">{{ position }}</h3>
            <div v-if="result?.winner" class="flex items-center space-x-3">
              <span class="text-3xl">🏆</span>
              <div>
                <p class="font-medium">{{ result.winner }}</p>
                <p class="text-sm text-gray-500">{{ result.winnerVotes || 0 }} votes</p>
              </div>
            </div>
            <p v-else class="text-gray-400 text-sm">No votes yet</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Reset Confirmation Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showResetModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl max-w-md w-full p-8">
            <div class="text-center">
              <span class="text-6xl mb-4 block">⚠️</span>
              <h3 class="text-2xl font-bold text-gray-800 mb-4">Reset Election?</h3>
              <p class="text-gray-600 mb-6">
                This will delete ALL votes and reset all voters' status. This action cannot be undone!
              </p>
              <div class="flex gap-4">
                <button @click="showResetModal = false" 
                        class="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  Cancel
                </button>
                <button @click="resetElection" 
                        class="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Reset Election
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '/src/stores/auth.js'
import { useElectionStore } from '/src/stores/election.js'
import { useUIStore } from '/src/stores/ui.js'

const router = useRouter()
const auth = useAuthStore()
const election = useElectionStore()
const ui = useUIStore()

const showResetModal = ref(false)
const loading = ref(true)
const error = ref(null)

// Initialize stats with default values
const stats = computed(() => {
  return {
    totalVoters: election.statistics?.totalVoters || 0,
    votersVoted: election.statistics?.votersVoted || 0,
    votersNotVoted: election.statistics?.votersNotVoted || 0,
    turnoutPercentage: election.statistics?.turnoutPercentage || 0,
    totalCandidates: election.statistics?.totalCandidates || 0,
    totalVotes: election.statistics?.totalVotes || 0,
    votesPerPosition: election.statistics?.votesPerPosition || {}
  }
})

const recentVotes = computed(() => {
  if (!election.votes) return []
  
  return election.votes
    .slice(-5)
    .reverse()
    .map(vote => ({
      ...vote,
      voterName: election.getVoterById?.(vote.voterId)?.fullName || 'Unknown',
      candidateName: election.getCandidateById?.(vote.candidateId)?.name || 'Unknown'
    }))
})

const getLeadingCandidate = () => {
  if (!election.detailedResults) return 'No votes'
  
  let maxVotes = 0
  let leadingCandidate = null
  
  Object.values(election.detailedResults).forEach(result => {
    if (result?.winnerVotes > maxVotes) {
      maxVotes = result.winnerVotes
      leadingCandidate = result.winner
    }
  })
  
  return leadingCandidate || 'No votes'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

const resetElection = async () => {
  showResetModal.value = false
  loading.value = true
  try {
    await election.resetElection()
    await loadData()
    ui.showSuccess('Election reset successfully!')
  } catch (err) {
    error.value = 'Failed to reset election'
  } finally {
    loading.value = false
  }
}

const loadData = async () => {
  loading.value = true
  error.value = null
  try {
    await election.loadAllData()
  } catch (err) {
    error.value = 'Failed to load dashboard data'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
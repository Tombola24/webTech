<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-800">📈 Election Results</h1>
      <div class="flex gap-4">
        <button @click="refreshResults" :disabled="loading"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                       transition-colors flex items-center space-x-2">
          <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>🔄 Refresh</span>
        </button>
        <button @click="exportResults"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          📥 Export CSV
        </button>
        <button @click="printResults"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          🖨️ Print
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="text-sm text-gray-500 mb-2">Total Voters</div>
        <div class="text-3xl font-bold text-blue-600">{{ stats.totalVoters || 0 }}</div>
        <div class="text-xs text-gray-400 mt-1">Registered</div>
      </div>
      
      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="text-sm text-gray-500 mb-2">Votes Cast</div>
        <div class="text-3xl font-bold text-green-600">{{ stats.votersVoted || 0 }}</div>
        <div class="text-xs text-gray-400 mt-1">{{ stats.turnoutPercentage || 0 }}% turnout</div>
      </div>
      
      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="text-sm text-gray-500 mb-2">Not Voted</div>
        <div class="text-3xl font-bold text-yellow-600">{{ stats.votersNotVoted || 0 }}</div>
        <div class="text-xs text-gray-400 mt-1">{{ calculateAbstention() }}% abstention</div>
      </div>
      
      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="text-sm text-gray-500 mb-2">Total Votes</div>
        <div class="text-3xl font-bold text-purple-600">{{ stats.totalVotes || 0 }}</div>
        <div class="text-xs text-gray-400 mt-1">{{ calculateAvgVotes() }} avg per position</div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <h3 class="text-lg font-semibold mb-4">Most Active Position</h3>
        <div class="text-3xl font-bold mb-2">{{ mostActivePosition }}</div>
        <div class="text-purple-100">{{ getVotesForPosition(mostActivePosition) }} votes</div>
      </div>

      <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
        <h3 class="text-lg font-semibold mb-4">Leading Candidate</h3>
        <div class="text-3xl font-bold mb-2">{{ leadingCandidate.name }}</div>
        <div class="text-green-100">{{ leadingCandidate.votes }} votes ({{ leadingCandidate.percentage }}%)</div>
      </div>

      <div class="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
        <h3 class="text-lg font-semibold mb-4">Closest Race</h3>
        <div class="text-3xl font-bold mb-2">{{ closestRace.position }}</div>
        <div class="text-orange-100">Margin: {{ closestRace.margin }} votes</div>
      </div>
    </div>

    <!-- Results by Position -->
    <div v-for="(result, position) in election.detailedResults" :key="position" 
         class="bg-white rounded-xl shadow-lg p-6">
      
      <!-- Position Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">{{ position }}</h2>
        <div class="flex items-center space-x-4">
          <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
            Total: {{ result.totalVotes }} votes
          </span>
          <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            Turnout: {{ calculatePositionTurnout(result.totalVotes) }}%
          </span>
        </div>
      </div>

      <!-- Winner Banner -->
      <div v-if="result.winner" class="bg-gradient-to-r from-yellow-400 to-orange-500 
                    rounded-lg p-4 mb-6 text-white flex items-center justify-between">
        <div class="flex items-center">
          <span class="text-3xl mr-4">🏆</span>
          <div>
            <span class="font-medium">Winner:</span>
            <span class="font-bold text-xl ml-2">{{ result.winner }}</span>
            <span class="ml-3 text-sm opacity-90">({{ result.winnerVotes }} votes)</span>
          </div>
        </div>
        <span v-if="isWinnerLandslide(result)" class="px-3 py-1 bg-white text-orange-600 rounded-full text-sm font-bold">
          Landslide Victory!
        </span>
      </div>

      <!-- Results Table -->
      <div class="space-y-4">
        <div v-for="(votes, candidate) in result.candidates" :key="candidate" 
             class="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded-lg">
          
          <!-- Rank -->
          <div class="w-8 text-center font-bold text-gray-400">
            {{ getRank(candidate, result) }}
          </div>

          <!-- Candidate Name -->
          <div class="w-48 font-medium" :class="candidate === result.winner ? 'text-green-600' : ''">
            {{ candidate }}
            <span v-if="candidate === result.winner" class="ml-2">⭐</span>
          </div>

          <!-- Party -->
          <div class="w-32 text-sm text-gray-500">
            {{ getCandidateParty(candidate, position) }}
          </div>

          <!-- Vote Count -->
          <div class="w-20 text-right font-medium">{{ votes }}</div>

          <!-- Percentage -->
          <div class="w-20 text-gray-600">{{ calculatePercentage(votes, result.totalVotes) }}%</div>

          <!-- Progress Bar -->
          <div class="flex-1">
            <div class="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-purple-600 rounded-full transition-all duration-500"
                   :style="{ width: calculatePercentage(votes, result.totalVotes) + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Total Row -->
        <div class="flex items-center space-x-4 pt-4 border-t border-gray-200 font-bold">
          <div class="w-8"></div>
          <div class="w-48">Total</div>
          <div class="w-32"></div>
          <div class="w-20 text-right">{{ result.totalVotes }}</div>
          <div class="w-20">100%</div>
          <div class="flex-1"></div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="mt-6 grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <span class="text-sm text-gray-500">Winner Margin</span>
          <div class="text-lg font-bold">{{ calculateWinnerMargin(result) }} votes</div>
        </div>
        <div>
          <span class="text-sm text-gray-500">Total Candidates</span>
          <div class="text-lg font-bold">{{ Object.keys(result.candidates).length }}</div>
        </div>
        <div>
          <span class="text-sm text-gray-500">Votes per Candidate</span>
          <div class="text-lg font-bold">{{ calculateAvgVotesPerCandidate(result).toFixed(1) }}</div>
        </div>
        <div>
          <span class="text-sm text-gray-500">Spoiled/Abstained</span>
          <div class="text-lg font-bold">{{ calculateAbstained(result) }}</div>
        </div>
      </div>
    </div>

    <!-- Detailed Statistics -->
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-6">📊 Detailed Analysis</h2>

      <div class="grid md:grid-cols-3 gap-8">
        <!-- Votes per Position Chart -->
        <div>
          <h3 class="font-medium text-gray-700 mb-4">Votes per Position</h3>
          <div class="space-y-3">
            <div v-for="(votes, position) in stats.votesPerPosition" :key="position"
                 class="flex justify-between items-center">
              <span class="text-sm">{{ position }}</span>
              <div class="flex items-center space-x-4">
                <span class="font-bold">{{ votes }}</span>
                <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-purple-600 rounded-full" 
                       :style="{ width: (votes / stats.totalVotes * 100) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Voter Demographics -->
        <div>
          <h3 class="font-medium text-gray-700 mb-4">Voter Demographics</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm">Registered Voters</span>
              <span class="font-bold">{{ stats.totalVoters || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm">Voted</span>
              <span class="font-bold text-green-600">{{ stats.votersVoted || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm">Abstained</span>
              <span class="font-bold text-red-600">{{ stats.votersNotVoted || 0 }}</span>
            </div>
            <div class="flex justify-between pt-2 border-t">
              <span class="text-sm">Turnout Rate</span>
              <span class="font-bold text-purple-600">{{ stats.turnoutPercentage || 0 }}%</span>
            </div>
          </div>

          <!-- Turnout Gauge -->
          <div class="mt-6">
            <div class="relative pt-1">
              <div class="flex mb-2 items-center justify-between">
                <div>
                  <span class="text-xs font-semibold inline-block text-purple-600">
                    Voter Turnout
                  </span>
                </div>
                <div class="text-right">
                  <span class="text-xs font-semibold inline-block text-purple-600">
                    {{ stats.turnoutPercentage || 0 }}%
                  </span>
                </div>
              </div>
              <div class="overflow-hidden h-2 text-xs flex rounded bg-purple-200">
                <div :style="{ width: (stats.turnoutPercentage || 0) + '%' }"
                     class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-600">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Election Info -->
        <div>
          <h3 class="font-medium text-gray-700 mb-4">Election Summary</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm">Total Positions</span>
              <span class="font-bold">{{ election.positions.length }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm">Total Candidates</span>
              <span class="font-bold">{{ stats.totalCandidates || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm">Avg Candidates/Position</span>
              <span class="font-bold">{{ (stats.totalCandidates / election.positions.length).toFixed(1) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm">Avg Votes/Candidate</span>
              <span class="font-bold">{{ (stats.totalVotes / stats.totalCandidates).toFixed(1) }}</span>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="mt-6 grid grid-cols-2 gap-2">
            <div class="bg-green-50 p-3 rounded-lg text-center">
              <div class="text-2xl font-bold text-green-600">{{ getTotalWinners() }}</div>
              <div class="text-xs text-gray-600">Winners</div>
            </div>
            <div class="bg-blue-50 p-3 rounded-lg text-center">
              <div class="text-2xl font-bold text-blue-600">{{ getTieCount() }}</div>
              <div class="text-xs text-gray-600">Ties</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useElectionStore } from '/src/stores/election.js'

const election = useElectionStore()
const loading = ref(false)

const stats = computed(() => election.statistics)

// Calculate derived statistics
const calculateAbstention = () => {
  const total = stats.value.totalVoters || 0
  const notVoted = stats.value.votersNotVoted || 0
  return total > 0 ? ((notVoted / total) * 100).toFixed(1) : 0
}

const calculateAvgVotes = () => {
  const total = stats.value.totalVotes || 0
  const positions = election.positions.length
  return positions > 0 ? (total / positions).toFixed(1) : 0
}

const mostActivePosition = computed(() => {
  let maxVotes = 0
  let position = 'N/A'
  
  Object.entries(stats.value.votesPerPosition || {}).forEach(([pos, votes]) => {
    if (votes > maxVotes) {
      maxVotes = votes
      position = pos
    }
  })
  
  return position
})

const getVotesForPosition = (position) => {
  return stats.value.votesPerPosition?.[position] || 0
}

const leadingCandidate = computed(() => {
  let maxVotes = 0
  let candidate = { name: 'N/A', votes: 0, percentage: 0 }
  
  Object.values(election.detailedResults).forEach(result => {
    if (result.winnerVotes > maxVotes) {
      maxVotes = result.winnerVotes
      candidate = {
        name: result.winner,
        votes: result.winnerVotes,
        percentage: ((result.winnerVotes / result.totalVotes) * 100).toFixed(1)
      }
    }
  })
  
  return candidate
})

const closestRace = computed(() => {
  let smallestMargin = Infinity
  let closest = { position: 'N/A', margin: 0 }
  
  Object.entries(election.detailedResults).forEach(([position, result]) => {
    const votes = Object.values(result.candidates).sort((a, b) => b - a)
    if (votes.length >= 2) {
      const margin = votes[0] - votes[1]
      if (margin < smallestMargin) {
        smallestMargin = margin
        closest = { position, margin }
      }
    }
  })
  
  return closest
})

const calculatePercentage = (votes, total) => {
  if (total === 0) return 0
  return ((votes / total) * 100).toFixed(1)
}

const calculatePositionTurnout = (positionVotes) => {
  const totalVoters = stats.value.totalVoters || 0
  return totalVoters > 0 ? ((positionVotes / totalVoters) * 100).toFixed(1) : 0
}

const getCandidateParty = (candidateName, position) => {
  const candidate = election.candidates.find(
    c => c.name === candidateName && c.position === position
  )
  return candidate?.party || 'Unknown'
}

const getRank = (candidate, result) => {
  const sorted = Object.entries(result.candidates).sort((a, b) => b[1] - a[1])
  const index = sorted.findIndex(([name]) => name === candidate)
  return index + 1
}

const calculateWinnerMargin = (result) => {
  const votes = Object.values(result.candidates)
  if (votes.length < 2) return 0
  const sorted = votes.sort((a, b) => b - a)
  return sorted[0] - (sorted[1] || 0)
}

const isWinnerLandslide = (result) => {
  const margin = calculateWinnerMargin(result)
  const total = result.totalVotes
  return total > 0 && (margin / total) > 0.3 // 30% margin
}

const calculateAvgVotesPerCandidate = (result) => {
  const candidates = Object.keys(result.candidates).length
  return candidates > 0 ? result.totalVotes / candidates : 0
}

const calculateAbstained = (result) => {
  const totalVoters = stats.value.totalVoters || 0
  return totalVoters - result.totalVotes
}

const getTotalWinners = () => {
  return Object.values(election.detailedResults).filter(r => r.winner).length
}

const getTieCount = () => {
  let ties = 0
  Object.values(election.detailedResults).forEach(result => {
    const votes = Object.values(result.candidates)
    const sorted = votes.sort((a, b) => b - a)
    if (sorted.length >= 2 && sorted[0] === sorted[1]) {
      ties++
    }
  })
  return ties
}

const refreshResults = async () => {
  loading.value = true
  await election.loadResults()
  await election.loadStatistics()
  loading.value = false
}

const exportResults = () => {
  // Convert results to CSV
  let csv = 'Position,Candidate,Party,Votes,Percentage\n'
  
  Object.entries(election.detailedResults).forEach(([position, result]) => {
    Object.entries(result.candidates).forEach(([candidate, votes]) => {
      const party = getCandidateParty(candidate, position)
      const percentage = calculatePercentage(votes, result.totalVotes)
      csv += `${position},${candidate},${party},${votes},${percentage}%\n`
    })
  })
  
  // Add summary
  csv += '\nSummary\n'
  csv += `Total Voters,${stats.value.totalVoters}\n`
  csv += `Votes Cast,${stats.value.totalVotes}\n`
  csv += `Turnout,${stats.value.turnoutPercentage}%\n`
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `election-results-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const printResults = () => {
  window.print()
}

onMounted(() => {
  if (Object.keys(election.detailedResults).length === 0) {
    election.loadResults()
    election.loadStatistics()
  }
})
</script>

<style scoped>
@media print {
  .bg-gradient-to-r {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
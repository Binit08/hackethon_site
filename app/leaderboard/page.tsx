"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Trophy, Medal, Award, Crown, TrendingUp, Users, Target } from "lucide-react"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { Sparkles } from "@/components/ui/sparkles"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"

interface LeaderboardEntry {
  userId: string
  userName: string
  teamName?: string
  totalScore: number
  totalSubmissions: number
  acceptedSubmissions: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard")
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to fetch leaderboard" }))
        throw new Error(error.error || "Failed to fetch leaderboard")
      }
      const contentType = response.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        throw new Error("Server returned non-JSON response")
      }
      const data = await response.json()
      setLeaderboard(data)
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-400" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-300" />
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />
    return null
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">🥇 Champion</Badge>
    if (rank === 2) return <Badge className="bg-gray-400/10 text-gray-300 border-gray-400/20">🥈 Runner-up</Badge>
    if (rank === 3) return <Badge className="bg-amber-600/10 text-amber-400 border-amber-600/20">🥉 3rd Place</Badge>
    return <Badge className="bg-[#6aa5ff]/10 text-[#6aa5ff] border-[#6aa5ff]/20">#{rank}</Badge>
  }

  const getAccuracy = (accepted: number, total: number) => {
    return total > 0 ? ((accepted / total) * 100).toFixed(1) : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const topThree = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 py-8 pt-24 relative">
      <BackgroundBeams />
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4 animate-pulse" />
          <TextGenerateEffect 
            words="Leaderboard"
            className="text-4xl font-bold text-gray-900 mb-2"
          />
          <p className="text-gray-600">Top performers in the hackathon challenge</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-[#192345] border-[#6aa5ff]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Participants</p>
                  <p className="text-3xl font-bold text-gray-900">{leaderboard.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Top Score</p>
                  <p className="text-3xl font-bold text-yellow-500">
                    {leaderboard.length > 0 ? leaderboard[0].totalScore : 0}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-400/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Submissions</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {leaderboard.reduce((sum, entry) => sum + entry.totalSubmissions, 0)}
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-400/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {leaderboard.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl">
            <CardContent className="py-16">
              <div className="text-center">
                <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No submissions yet</p>
                <p className="text-gray-500 text-sm mt-2">Be the first to submit and claim the top spot!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Podium - Top 3 */}
            {topThree.length > 0 && (
              <div className="mb-8 relative">
                <Sparkles className="absolute inset-0 pointer-events-none" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                  {/* 2nd Place */}
                  {topThree[1] && (
                    <div className="order-2 md:order-1">
                      <Card className="bg-gradient-to-br from-gray-100 to-gray-50 border-gray-300 hover:border-gray-400 transition-all shadow-lg">
                        <CardContent className="p-6 text-center">
                          <div className="mb-4">
                            <Medal className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                            <Badge className="bg-gray-200 text-gray-700 border-gray-300">🥈 2nd Place</Badge>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {topThree[1].teamName || topThree[1].userName}
                          </h3>
                          {topThree[1].teamName && (
                            <p className="text-sm text-gray-600 mb-3">{topThree[1].userName}</p>
                          )}
                          <div className="text-4xl font-bold text-gray-500 mb-4">
                            {topThree[1].totalScore}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-white rounded p-2 border border-gray-200">
                              <div className="text-gray-600">Accepted</div>
                              <div className="text-gray-900 font-semibold">{topThree[1].acceptedSubmissions}</div>
                            </div>
                            <div className="bg-white rounded p-2 border border-gray-200">
                              <div className="text-gray-600">Accuracy</div>
                              <div className="text-gray-900 font-semibold">
                                {getAccuracy(topThree[1].acceptedSubmissions, topThree[1].totalSubmissions)}%
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* 1st Place */}
                  <div className="order-1 md:order-2">
                    <Card className="bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-300 hover:border-yellow-400 transition-all shadow-xl">
                      <CardContent className="p-8 text-center">
                        <div className="mb-4">
                          <Crown className="h-20 w-20 text-yellow-500 mx-auto mb-2 animate-pulse" />
                          <Badge className="bg-yellow-200 text-yellow-700 border-yellow-300 text-sm">🥇 Champion</Badge>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {topThree[0].teamName || topThree[0].userName}
                        </h3>
                        {topThree[0].teamName && (
                          <p className="text-sm text-gray-600 mb-4">{topThree[0].userName}</p>
                        )}
                        <div className="text-5xl font-bold text-yellow-500 mb-6">
                          {topThree[0].totalScore}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-white rounded p-3 border border-yellow-200">
                            <div className="text-gray-600">Accepted</div>
                            <div className="text-gray-900 font-semibold text-lg">{topThree[0].acceptedSubmissions}</div>
                          </div>
                          <div className="bg-white rounded p-3 border border-yellow-200">
                            <div className="text-gray-600">Accuracy</div>
                            <div className="text-gray-900 font-semibold text-lg">
                              {getAccuracy(topThree[0].acceptedSubmissions, topThree[0].totalSubmissions)}%
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 3rd Place */}
                  {topThree[2] && (
                    <div className="order-3">
                      <Card className="bg-gradient-to-br from-amber-100 to-amber-50 border-amber-300 hover:border-amber-400 transition-all shadow-lg">
                        <CardContent className="p-6 text-center">
                          <div className="mb-4">
                            <Award className="h-16 w-16 text-amber-600 mx-auto mb-2" />
                            <Badge className="bg-amber-200 text-amber-700 border-amber-300">🥉 3rd Place</Badge>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {topThree[2].teamName || topThree[2].userName}
                          </h3>
                          {topThree[2].teamName && (
                            <p className="text-sm text-gray-600 mb-3">{topThree[2].userName}</p>
                          )}
                          <div className="text-4xl font-bold text-amber-600 mb-4">
                            {topThree[2].totalScore}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-white rounded p-2 border border-amber-200">
                              <div className="text-gray-600">Accepted</div>
                              <div className="text-gray-900 font-semibold">{topThree[2].acceptedSubmissions}</div>
                            </div>
                            <div className="bg-white rounded p-2 border border-amber-200">
                              <div className="text-gray-600">Accuracy</div>
                              <div className="text-gray-900 font-semibold">
                                {getAccuracy(topThree[2].acceptedSubmissions, topThree[2].totalSubmissions)}%
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Full Rankings Table */}
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl">
              <CardHeader className="border-b border-blue-100">
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Complete Rankings
                </CardTitle>
                <CardDescription className="text-gray-600">
                  All participants ranked by total score
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-blue-50 border-b border-blue-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Participant
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Solved
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Accuracy
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-100">
                      {leaderboard.map((entry, index) => (
                        <tr 
                          key={entry.userId} 
                          className={`hover:bg-blue-50/50 transition-colors ${
                            index < 3 ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {getRankIcon(index + 1)}
                              <span className="text-gray-900 font-semibold">#{index + 1}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900 flex items-center gap-2">
                                {entry.teamName || entry.userName}
                                {index < 3 && getRankBadge(index + 1)}
                              </div>
                              {entry.teamName && (
                                <div className="text-sm text-gray-600 mt-1">
                                  {entry.userName}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-2xl font-bold text-blue-600">
                              {entry.totalScore}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-900 font-semibold">
                              {entry.acceptedSubmissions}
                              <span className="text-gray-500">/{entry.totalSubmissions}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="text-gray-900 font-semibold">
                                {getAccuracy(entry.acceptedSubmissions, entry.totalSubmissions)}%
                              </div>
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ 
                                    width: `${getAccuracy(entry.acceptedSubmissions, entry.totalSubmissions)}%` 
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}


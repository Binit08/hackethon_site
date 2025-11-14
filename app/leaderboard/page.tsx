"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Trophy, Medal, Award, Crown, TrendingUp, Users, Target } from "lucide-react"

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
      <div className="min-h-screen bg-[#151c2e] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6aa5ff]" />
      </div>
    )
  }

  const topThree = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  return (
    <div className="min-h-screen bg-[#151c2e] py-8 pt-24">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Crown className="h-8 w-8 text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-white/60">Top performers in the hackathon challenge</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-[#192345] border-[#6aa5ff]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Total Participants</p>
                  <p className="text-3xl font-bold text-white">{leaderboard.length}</p>
                </div>
                <Users className="h-8 w-8 text-[#6aa5ff]/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#192345] border-[#6aa5ff]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Top Score</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {leaderboard.length > 0 ? leaderboard[0].totalScore : 0}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-400/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#192345] border-[#6aa5ff]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Total Submissions</p>
                  <p className="text-3xl font-bold text-[#6aa5ff]">
                    {leaderboard.reduce((sum, entry) => sum + entry.totalSubmissions, 0)}
                  </p>
                </div>
                <Target className="h-8 w-8 text-[#6aa5ff]/40" />
              </div>
            </CardContent>
          </Card>
        </div>

        {leaderboard.length === 0 ? (
          <Card className="bg-[#192345] border-[#6aa5ff]/20">
            <CardContent className="py-16">
              <div className="text-center">
                <Trophy className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-lg">No submissions yet</p>
                <p className="text-white/40 text-sm mt-2">Be the first to submit and claim the top spot!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Podium - Top 3 */}
            {topThree.length > 0 && (
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 2nd Place */}
                  {topThree[1] && (
                    <div className="order-2 md:order-1">
                      <Card className="bg-gradient-to-br from-gray-400/10 to-gray-500/5 border-gray-400/20 hover:border-gray-400/40 transition-all">
                        <CardContent className="p-6 text-center">
                          <div className="mb-4">
                            <Medal className="h-16 w-16 text-gray-300 mx-auto mb-2" />
                            <Badge className="bg-gray-400/10 text-gray-300 border-gray-400/20">🥈 2nd Place</Badge>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            {topThree[1].teamName || topThree[1].userName}
                          </h3>
                          {topThree[1].teamName && (
                            <p className="text-sm text-white/50 mb-3">{topThree[1].userName}</p>
                          )}
                          <div className="text-4xl font-bold text-gray-300 mb-4">
                            {topThree[1].totalScore}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-[#0f1729] rounded p-2">
                              <div className="text-white/60">Accepted</div>
                              <div className="text-white font-semibold">{topThree[1].acceptedSubmissions}</div>
                            </div>
                            <div className="bg-[#0f1729] rounded p-2">
                              <div className="text-white/60">Accuracy</div>
                              <div className="text-white font-semibold">
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
                    <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-400/30 hover:border-yellow-400/50 transition-all shadow-lg shadow-yellow-500/10">
                      <CardContent className="p-8 text-center">
                        <div className="mb-4">
                          <Crown className="h-20 w-20 text-yellow-400 mx-auto mb-2 animate-pulse" />
                          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-sm">🥇 Champion</Badge>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {topThree[0].teamName || topThree[0].userName}
                        </h3>
                        {topThree[0].teamName && (
                          <p className="text-sm text-white/50 mb-4">{topThree[0].userName}</p>
                        )}
                        <div className="text-5xl font-bold text-yellow-400 mb-6">
                          {topThree[0].totalScore}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-[#0f1729] rounded p-3">
                            <div className="text-white/60">Accepted</div>
                            <div className="text-white font-semibold text-lg">{topThree[0].acceptedSubmissions}</div>
                          </div>
                          <div className="bg-[#0f1729] rounded p-3">
                            <div className="text-white/60">Accuracy</div>
                            <div className="text-white font-semibold text-lg">
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
                      <Card className="bg-gradient-to-br from-amber-600/10 to-amber-700/5 border-amber-600/20 hover:border-amber-600/40 transition-all">
                        <CardContent className="p-6 text-center">
                          <div className="mb-4">
                            <Award className="h-16 w-16 text-amber-500 mx-auto mb-2" />
                            <Badge className="bg-amber-600/10 text-amber-400 border-amber-600/20">🥉 3rd Place</Badge>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            {topThree[2].teamName || topThree[2].userName}
                          </h3>
                          {topThree[2].teamName && (
                            <p className="text-sm text-white/50 mb-3">{topThree[2].userName}</p>
                          )}
                          <div className="text-4xl font-bold text-amber-400 mb-4">
                            {topThree[2].totalScore}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-[#0f1729] rounded p-2">
                              <div className="text-white/60">Accepted</div>
                              <div className="text-white font-semibold">{topThree[2].acceptedSubmissions}</div>
                            </div>
                            <div className="bg-[#0f1729] rounded p-2">
                              <div className="text-white/60">Accuracy</div>
                              <div className="text-white font-semibold">
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
            <Card className="bg-[#192345] border-[#6aa5ff]/20">
              <CardHeader className="border-b border-[#6aa5ff]/10">
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#6aa5ff]" />
                  Complete Rankings
                </CardTitle>
                <CardDescription className="text-white/60">
                  All participants ranked by total score
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0f1729] border-b border-[#6aa5ff]/10">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                          Participant
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                          Solved
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                          Accuracy
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#6aa5ff]/10">
                      {leaderboard.map((entry, index) => (
                        <tr 
                          key={entry.userId} 
                          className={`hover:bg-[#1f2d4f]/30 transition-colors ${
                            index < 3 ? 'bg-[#1f2d4f]/10' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {getRankIcon(index + 1)}
                              <span className="text-white font-semibold">#{index + 1}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-white flex items-center gap-2">
                                {entry.teamName || entry.userName}
                                {index < 3 && getRankBadge(index + 1)}
                              </div>
                              {entry.teamName && (
                                <div className="text-sm text-white/50 mt-1">
                                  {entry.userName}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-2xl font-bold text-[#6aa5ff]">
                              {entry.totalScore}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-white font-semibold">
                              {entry.acceptedSubmissions}
                              <span className="text-white/50">/{entry.totalSubmissions}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="text-white font-semibold">
                                {getAccuracy(entry.acceptedSubmissions, entry.totalSubmissions)}%
                              </div>
                              <div className="w-24 bg-[#0f1729] rounded-full h-2">
                                <div 
                                  className="bg-[#6aa5ff] h-2 rounded-full transition-all"
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


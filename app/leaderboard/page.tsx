"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Trophy, Medal, Award } from "lucide-react"

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
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />
    return <span className="text-muted-foreground">{rank}</span>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">Top performers in the hackathon</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rankings</CardTitle>
            <CardDescription>Based on total score and number of accepted submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No submissions yet. Be the first to submit!
                </p>
              ) : (
                leaderboard.map((entry, index) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      index < 3 ? "bg-muted" : "bg-background"
                    } hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 flex justify-center">
                        {getRankIcon(index + 1)}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {entry.teamName || entry.userName}
                        </p>
                        {entry.teamName && (
                          <p className="text-sm text-muted-foreground">
                            {entry.userName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <p className="text-sm text-muted-foreground">Score</p>
                        <p className="font-bold text-lg">{entry.totalScore}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Accepted</p>
                        <p className="font-semibold">
                          {entry.acceptedSubmissions}/{entry.totalSubmissions}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


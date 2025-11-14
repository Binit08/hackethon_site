export type RoundWindow = { start: Date; end: Date; label: string }

// Define schedule windows (UTC to avoid timezone ambiguity)
// Round 1: January 2026 (Second Week) -> Jan 8–14, 2026
// Round 2: February 2026 (First Week) -> Feb 1–7, 2026
// Round 3: February 2026 (Last Week) -> Feb 22–28, 2026
export const schedule = {
  round1: {
    start: new Date(Date.UTC(2026, 0, 8, 0, 0, 0)),
    end: new Date(Date.UTC(2026, 0, 14, 23, 59, 59)),
    label: "January 2026 (Second Week)",
  } as RoundWindow,
  round2: {
    start: new Date(Date.UTC(2026, 1, 1, 0, 0, 0)),
    end: new Date(Date.UTC(2026, 1, 7, 23, 59, 59)),
    label: "February 2026 (First Week)",
  } as RoundWindow,
  round3: {
    start: new Date(Date.UTC(2026, 1, 22, 0, 0, 0)),
    end: new Date(Date.UTC(2026, 1, 28, 23, 59, 59)),
    label: "February 2026 (Last Week)",
  } as RoundWindow,
}

export function isNowWithin(win: RoundWindow, now: Date = new Date()): boolean {
  return now >= win.start && now <= win.end
}

export function windowStatus(win: RoundWindow, now: Date = new Date()): "upcoming" | "active" | "closed" {
  if (now < win.start) return "upcoming"
  if (now > win.end) return "closed"
  return "active"
}

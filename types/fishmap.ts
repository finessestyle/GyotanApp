import { type Timestamp } from 'firebase/firestore'

interface FishMap {
  id: string
  title: string
  area: string
  season: string
  latitude: number
  longitude: number
  content: string
  updatedAt: Timestamp
}

export type { FishMap }
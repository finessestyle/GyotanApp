import { type Timestamp } from 'firebase/firestore'

interface ExifData {
  latitude: number
  longitude: number
  dateTime: string
}

interface Post {
  id: string
  userId: string
  userName: string
  userImage: string
  images: string[]
  exifData: ExifData[]
  area: string
  fishArea: string
  weather: string
  lure: string
  lureAction: string
  structure: string
  cover: string
  length: number
  weight: number
  catchFish: number
  updatedAt: Timestamp
  content: string
}

export type { Post }

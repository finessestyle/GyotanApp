import { View, StyleSheet, Text, Image, TouchableWithoutFeedback } from 'react-native'
import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy, where, Timestamp } from 'firebase/firestore'
import { db } from '../../config'
import { Link } from 'expo-router'
import MapView, { Marker, Callout } from 'react-native-maps'

interface ExifData {
  latitude: number
  longitude: number
}

interface Post {
  id: string
  exifData?: ExifData | ExifData[]
  length?: number
  lure?: string
  updatedAt?: any
  [key: string]: any
}

const Map = (): JSX.Element => {
  const [posts, setPosts] = useState<Post[]>([])
  const [initialRegion, setInitialRegion] = useState({
    latitude: 35.25020910118615,
    longitude: 136.08555032486245,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5
  })

  useEffect(() => {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const oneMonthAgoTimestamp = Timestamp.fromDate(oneMonthAgo)

    const ref = collection(db, 'posts')
    const q = query(
      ref,
      where('updatedAt', '>=', oneMonthAgoTimestamp),
      orderBy('updatedAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapShot) => {
      const remotePosts: Post[] = []
      snapShot.forEach((doc) => {
        const {
          userId, userName, userImage, images, weather, length, weight, lure,
          lureAction, catchFish, fishArea, area, structure, cover, exifData, updatedAt, content
        } = doc.data()
        remotePosts.push({
          id: doc.id,
          userId,
          userName,
          userImage,
          images,
          exifData,
          area,
          fishArea,
          weather,
          lure,
          lureAction,
          structure,
          cover,
          length,
          weight,
          catchFish,
          content,
          updatedAt
        })
      })
      setPosts(remotePosts)
    })

    return unsubscribe
  }, [])

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {posts.map((post) => {
          const exif = Array.isArray(post.exifData) ? post.exifData[0] : post.exifData
          if (!exif?.latitude || !exif?.longitude) return null
          return (
            <Marker
              key={post.id}
              coordinate={{
                latitude: exif.latitude,
                longitude: exif.longitude
              }}
            >
              <Callout>
                <Link
                  href={{ pathname: '/post/detail', params: { id: post.id } }}
                  asChild
                >
                  <TouchableWithoutFeedback>
                    <View style={{ alignItems: 'center' }}>
                      <Image
                        source={{ uri: post.images?.[0] }}
                        style={{ width: 130, height: 130, borderRadius: 10 }}
                        resizeMode="cover"
                      />
                      <Text>{`${post.length ?? '-'}cm / ${post.weight}g`}</Text>
                    </View>
                  </TouchableWithoutFeedback>
                </Link>
             </Callout>
            </Marker>
          )
        })}
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    flex: 1
  }
})

export default Map

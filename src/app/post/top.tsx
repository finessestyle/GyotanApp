import { View, FlatList, Text, StyleSheet } from 'react-native'
import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../../config'
import { type Post } from '../../../types/post'
import TopList from '../../components/TopList'

const top = (): JSX.Element => {
  const [posts, setPosts] = useState<Post []>([])

  useEffect(() => {
    const ref = collection(db, 'posts')
    const q = query(ref, orderBy('updatedAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const remotePosts: Post[] = []
      snapshot.forEach((doc) => {
        const {
          userId, userName, userImage, images, weather, length, weight, lure, lureColor,
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
          lureColor,
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
      <Text style={styles.title}>最新釣果</Text>
      <FlatList
        data={posts}
        numColumns={2}
        style={{ marginHorizontal: 8 }}
        renderItem={({ item }) => <TopList post={item} /> }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8'
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    marginVertical: 24,
    marginHorizontal: 16
  }
})

export default top

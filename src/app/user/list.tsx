import { View, Text, FlatList, StyleSheet } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { useEffect, useState, useCallback } from 'react'
import { collection, doc, getDocs, query, where, onSnapshot } from 'firebase/firestore'
import { db, auth } from '../../config'
import { type User } from '../../../types/user'
import FollowedUser from '../../components/FollowedUser'
import { chunk } from 'lodash'

const List = (): JSX.Element => {
  const [users, setUsers] = useState<User[]>([])
  const [followed, setFollowed] = useState<string[]>([])

  useFocusEffect(
    useCallback(() => {
      if (auth.currentUser === null) return
      const userRef = doc(db, 'users', auth.currentUser.uid)
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()
          const followedIds = Array.isArray(data?.followed) ? data.followed : []
          setFollowed(followedIds)
        }
      })
      return unsubscribe
    }, [])
  )

  useEffect(() => {
    if (auth.currentUser === null) return
    if (followed.length === 0) {
      setUsers([])
      return
    }

    const fetchFollowedUsers = async (): Promise<void> => {
      const chunks = chunk(followed, 10)
      const promises = chunks.map(async (chunkIds) => {
        const ref = collection(db, 'users')
        const q = query(ref, where('__name__', 'in', chunkIds))
        const snap = await getDocs(q)

        const usersChunk: User[] = snap.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            userName: data.userName,
            email: data.email,
            profile: data.profile,
            userImage: data.userImage,
            userYoutube: data.userYoutube,
            userTiktok: data.userTiktok,
            userInstagram: data.userInstagram,
            userX: data.userX,
            updatedAt: data.updatedAt,
            followed: data.followed
          }
        })

        return usersChunk
      })

      const resultChunks = await Promise.all(promises)
      const allUsers = resultChunks.flat()
      setUsers(allUsers)
    }

    void fetchFollowedUsers()
  }, [followed])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>フォローユーザー</Text>
      <FlatList
        data={users}
        renderItem={({ item }) => <FollowedUser user={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={
          <View style={{ padding: 20 }}>
            <Text>フォローユーザーがいません...。</Text>
          </View>
        }
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
  },
  columnWrapper: {
    justifyContent: 'space-between'
  }
})

export default List

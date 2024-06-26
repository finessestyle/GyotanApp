import {
  View, Text, StyleSheet, ScrollView, Image
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useState, useEffect } from 'react'
import { onSnapshot, doc } from 'firebase/firestore'
import { auth, db } from '../../config'
import { type User } from '../../../types/user'

const Detail = (): JSX.Element => {
  const id = String(useLocalSearchParams().id)
  console.log(id)
  const [user, setUser] = useState<User | null>(null)
  const imageUri = user !== null && Array.isArray(user.image) && user.image.length > 0 ? user.image[0] : undefined
  useEffect(() => {
    if (auth.currentUser === null) { return }
    const ref = doc(db, `users/${auth.currentUser.uid}/users`, id)
    const unsubscribe = onSnapshot(ref, (userDoc) => {
      const { email, password, username, profile, image, updatedAt } = userDoc.data() as User
      console.log(userDoc.data())
      setUser({
        id: userDoc.id,
        email,
        password,
        username,
        profile,
        image,
        updatedAt
      })
    })
    return unsubscribe
  }, [])

  return (
    <ScrollView>
      <View style={styles.inner}>
        <Text style={styles.title}>ユーザー情報</Text>
        <View style={styles.userImageTop}>
          <Image
            style={styles.userImage}
            source={{ uri: imageUri }}
          />
        </View>
        <View>
          <Text>{user?.username}さん</Text>
        </View>
        <View>
          <Text>{user?.email}</Text>
        </View>
        <View>
          <Text>{user?.profile}</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  inner: {
    marginVertical: 30,
    marginHorizontal: 19
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 'bold',
    marginBottom: 24
  },
  userImageTop: {
    alignContent: 'center'
  },
  userImage: {
    width: 200,
    height: 200,
    borderRadius: 100
  }
})
export default Detail

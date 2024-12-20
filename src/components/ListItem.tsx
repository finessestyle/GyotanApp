import {
  View, Text, TouchableOpacity, StyleSheet, Image, Alert
} from 'react-native'
import { Link } from 'expo-router'
import { deleteDoc, doc } from 'firebase/firestore'
import { ref, deleteObject, listAll } from 'firebase/storage'
import { type Post } from '../../types/post'
import { auth, db, storage } from '../config'
import Icon from '../components/Icon'

interface Props {
  post: Post
}

const deleteFiles = async (postId: string): Promise<void> => {
  try {
    // Firestoreのドキュメント削除
    const postRef = doc(db, 'posts', postId)
    await deleteDoc(postRef)

    // posts/{postId} 内のすべてのファイルを削除
    const postRefInStorage = ref(storage, `posts/${postId}`)
    const { items } = await listAll(postRefInStorage)

    for (const itemRef of items) {
      await deleteObject(itemRef)
    }

    Alert.alert('削除が完了しました')
  } catch (error) {
    console.log(error)
    Alert.alert('削除に失敗しました')
  }
}

const handlePress = (id: string, post?: Post): void => {
  if (post === null) {
    Alert.alert('投稿が見つかりませんでした')
    return
  }
  if (auth.currentUser?.uid === post?.userId) {
    Alert.alert('投稿を削除します', 'よろしいですか？', [
      {
        text: 'キャンセル',
        style: 'cancel'
      },
      {
        text: '投稿を削除する',
        style: 'destructive',
        onPress: () => {
          void deleteFiles(id)
        }
      }
    ])
  }
}

const ListItem = (props: Props): JSX.Element | null => {
  const { post } = props
  const { title, images, length, weight, updatedAt, area } = post
  const imageUri = Array.isArray(post.images) && post.images.length > 0 ? post.images[0] : undefined
  if (title === null || updatedAt === null || images === null || length === null || weight === null) { return null }
  // const dateString = post.updatedAt.toDate().toLocaleString('ja-JP')
  return (
    <Link
      href={{ pathname: '/post/detail', params: { id: post.id } }}
      asChild
    >
      <TouchableOpacity style={styles.listItem}>
        <View>
          <Image
            style={styles.listItemImage}
            source={{ uri: imageUri }}
          />
        </View>
        <View>
          <Text style={styles.listItemTitle}>{post.title}</Text>
          <Text style={styles.listItemDate}>{area}</Text>
          <View style={styles.fishInfo}>
            <Text style={styles.listItemDate}>{length}cm / </Text>
            <Text style={styles.listItemFish}>{weight}g</Text>
          </View>
        </View>
        {auth.currentUser?.uid === post?.userId && (
          <TouchableOpacity style={styles.deleteButton} onPress={() => { handlePress(post.id, post) }}>
            <Icon name='delete' size={32} color='#B0B0B0' />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Link>
  )
}

const styles = StyleSheet.create({
  listItem: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    borderRadius: 8,
    height: 'auto'
  },
  listItemImage: {
    width: 100,
    height: 70
  },
  listItemTitle: {
    paddingLeft: 16,
    fontSize: 16,
    lineHeight: 16
  },
  listItemDate: {
    paddingLeft: 16,
    fontSize: 12,
    lineHeight: 16,
    color: '#848484'
  },
  listItemFish: {
    fontSize: 12,
    lineHeight: 16,
    color: '#848484'
  },
  fishInfo: {
    flexDirection: 'row'
  },
  deleteButton: {
    position: 'absolute',
    right: 19
  }
})

export default ListItem

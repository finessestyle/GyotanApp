import {
  View, Text, TouchableWithoutFeedback, StyleSheet, Image
} from 'react-native'
import { Link } from 'expo-router'
import { type Post } from '../../types/post'

interface Props {
  post: Post
}

const TopList = (props: Props): JSX.Element | null => {
  const { post } = props
  const { images } = post
  const imageUri = Array.isArray(post.images) && post.images.length > 0 ? post.images[0] : undefined
  if (images === null) { return null }
  return (
    <Link
      href={{ pathname: '/post/detail', params: { id: post.id } }}
      asChild
    >
      <TouchableWithoutFeedback>
        <View style={styles.listItem}>
          <View style={styles.fishImage}>
            <Image
              style={styles.listItemImage}
              source={{ uri: imageUri }}
            />
            <View style={styles.fishInfo}>
              <Text style={styles.length}>{post?.length}cm / </Text>
              <Text style={styles.weight}>{post?.weight}g</Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Link>
  )
}

const styles = StyleSheet.create({
  listItem: {
    borderRadius: 8,
    width: '48%',
    height: 'auto',
    marginBottom: 8,
    marginHorizontal: 4
  },
  fishImage: {
    position: 'relative'
  },
  title: {
    color: '#B0B0B0'
  },
  listItemImage: {
    height: 140,
    borderRadius: 8
  },
  fishInfo: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 4,
    right: 8
  },
  length: {
    color: '#ffffff',
    fontSize: 14
  },
  weight: {
    color: '#ffffff',
    fontSize: 14
  }
})

export default TopList

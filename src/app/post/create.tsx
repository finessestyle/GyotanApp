import {
  View, ScrollView, Text, TextInput, Image, StyleSheet, Alert
} from 'react-native'
import { router } from 'expo-router'
import { useState } from 'react'
import { collection, addDoc, Timestamp, getDoc, doc, setDoc } from 'firebase/firestore'
import { db, auth, storage } from '../../config'
import RNPickerSelect from 'react-native-picker-select'
import * as ImagePicker from 'expo-image-picker'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import Button from '../../components/Button'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const handlePress = async (
  title: string,
  images: string[],
  weather: string,
  content: string,
  length: number | null,
  weight: number | null,
  lure: string,
  lureColor: string,
  catchFish: number | null,
  fishArea: string
): Promise<void> => {
  try {
    if (title === '') {
      Alert.alert('エラー', 'タイトルを入力してください')
      return
    }
    if (images.length === 0) {
      Alert.alert('エラー', '釣果画像を選択してください')
      return
    }
    if (weather === '') {
      Alert.alert('エラー', '天気を選択してください')
      return
    }
    if (content === '') {
      Alert.alert('エラー', '釣果内容を入力してください')
      return
    }
    if (fishArea === '') {
      Alert.alert('エラー', '釣果エリアを選択してください')
      return
    }
    if (length === null) {
      Alert.alert('エラー', '長さを入力してください')
      return
    }
    if (weight === null) {
      Alert.alert('エラー', '重さを入力してください')
      return
    }
    if (lure === '') {
      Alert.alert('エラー', 'ルアーを選択してください')
      return
    }
    if (lureColor === '') {
      Alert.alert('エラー', 'ルアーカラーを選択してください')
      return
    }
    if (catchFish === null) {
      Alert.alert('エラー', '釣果数を選択してください')
      return
    }

    if (auth.currentUser === null) return // ユーザーがログインしていない場合、関数を終了
    const userId = auth.currentUser.uid
    const userDoc = await getDoc(doc(db, 'users', userId)) // ドキュメントのデータを取得
    const userData = userDoc.data()
    const userName = userData?.userName ?? 'ゲスト'
    const userImage = userData?.imageUrl ?? ''
    const postRef = collection(db, 'posts')
    const newPostRef = await addDoc(postRef, {}) // 新しいドキュメントを追加し、ドキュメントIDを取得
    const postId = newPostRef.id

    const imageUrls = await Promise.all(images.map(async (image, index) => {
      const response = await fetch(image) // 画像をfetch
      const blob = await response.blob() // fetchした画像をblobに変換
      const imageName = `image_${Date.now()}_${index}`
      const storageRef = ref(storage, `posts/${postId}/${imageName}`)
      await uploadBytes(storageRef, blob) // 画像をストレージにアップロード
      return await getDownloadURL(storageRef) // アップロードした画像のダウンロードURLを取得
    }))
    await setDoc(doc(postRef, postId), { // Firestoreにドキュメントを追加
      userId,
      userName,
      userImage,
      title,
      images: imageUrls,
      weather,
      content,
      length,
      weight,
      lure,
      lureColor,
      catchFish,
      fishArea,
      updatedAt: Timestamp.fromDate(new Date()) // 現在のタイムスタンプを保存
    })

    router.back() // 成功したら前のページに戻る
  } catch (error) {
    console.log(error)
    Alert.alert('投稿に失敗しました')
  }
}

const generateCatchFishOptions = (): Array<{ label: string, value: number }> => {
  const options = []
  for (let i = 1; i <= 20; i += 1) {
    options.push({ label: `${i} `, value: i })
  }
  return options
}

const Create = (): JSX.Element => {
  const [title, setTitle] = useState('')
  const [images, setImages] = useState<Array<{ uri: string }>>([])
  const [weather, setWeather] = useState('')
  const [content, setContent] = useState('')
  const [fishArea, setFishArea] = useState('')
  const [length, setLength] = useState<number | null>(null)
  const [weight, setWeight] = useState<number | null>(null)
  const [lure, setLure] = useState('')
  const [lureColor, setLureColor] = useState('')
  const [catchFish, setCatchFish] = useState<number | null>(null)

  const pickImage = async (): Promise<void> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 3,
      quality: 1
    })
    if (!result.canceled) {
      setImages(prevImages => [...prevImages, ...result.assets.map(asset => ({ uri: asset.uri }))])
    }
  }

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.scrollContainer}>
      <ScrollView style={styles.inner}>
        <Text style={styles.title}>釣果投稿</Text>
        <Text style={styles.textTitle}>タイトル</Text>
        <TextInput
          style={styles.input}
          onChangeText={(text) => { setTitle(text) }}
          placeholder='タイトルを入力'
          keyboardType='default'
          returnKeyType='done'
        />
        <Text style={styles.textTitle}>ファイルを選択</Text>
        <Button
          label="釣果画像を選択"
          buttonStyle={{ height: 28, backgroundColor: '#F0F0F0' }}
          labelStyle={{ lineHeight: 16, color: '#000000' }}
          onPress={pickImage}
        />
        <View style={styles.imageContainer}>
          {images.map((image, index) => (
            <Image key={index} source={{ uri: image.uri }} style={styles.image} />
          ))}
        </View>
        <Text style={styles.textTitle}>釣果内容</Text>
        <TextInput
          style={styles.input}
          onChangeText={(text) => { setContent(text) }}
          placeholder='釣果内容を入力してください'
          keyboardType='default'
          returnKeyType='done'
        />
        <Text style={styles.textTitle}>天気を選択</Text>
        <RNPickerSelect
          onValueChange={(value: string | null) => {
            if (value !== null) {
              setWeather(value)
            }
          }}
          items={[
            { label: '晴れ', value: '晴れ' },
            { label: '曇り', value: '曇り' },
            { label: '雨', value: '雨' },
            { label: '雪', value: '雪' }
          ]}
          style={pickerSelectStyles}
          placeholder={{ label: '天気を選択してください', value: null }}
        />
        <Text style={styles.textTitle}>釣果エリア</Text>
        <RNPickerSelect
          onValueChange={(value: string | null) => {
            if (value !== null) {
              setFishArea(value)
            }
          }}
          items={[
            { label: '北湖北エリア', value: '北湖北エリア' },
            { label: '北湖東エリア', value: '北湖東エリア' },
            { label: '北湖西エリア', value: '北湖西エリア' },
            { label: '南湖東エリア', value: '南湖東エリア' },
            { label: '南湖西エリア', value: '南湖西エリア' }
          ]}
          style={pickerSelectStyles}
          placeholder={{ label: '釣果エリアを選択してください', value: null }}
        />

        <Text style={styles.textTitle}>サイズ</Text>
        <TextInput
          style={styles.input}
          onChangeText={(text) => { setLength(Number(text)) }}
          placeholder='長さを入力してください'
          keyboardType='numeric'
          returnKeyType='done'
        />
        <Text style={styles.textTitle}>重さ</Text>
        <TextInput
          style={styles.input}
          onChangeText={(text) => { setWeight(Number(text)) }}
          placeholder='重さを入力してください'
          keyboardType='number-pad'
          returnKeyType='done'
        />
        <Text style={styles.textTitle}>ルアーを選択</Text>
        <RNPickerSelect
          onValueChange={(value: string | null) => {
            if (value !== null) {
              setLure(value)
            }
          }}
          items={[
            { label: 'クランクベイト', value: 'クランクベイト' },
            { label: 'ディープクランク', value: 'ディープクランク' },
            { label: 'ミノー', value: 'ミノー' },
            { label: 'シャッド', value: 'シャッド' },
            { label: 'バイブレーション', value: 'バイブレーション' },
            { label: 'スピナーベイト', value: 'スピナーベイト' },
            { label: 'バズベイト', value: 'バズベイト' },
            { label: 'チャターベイト', value: 'チャターベイト' },
            { label: 'ビッグベイト', value: 'ビッグベイト' },
            { label: 'I字系', value: 'I字系' },
            { label: 'ラバージグ', value: 'ラバージグ' },
            { label: 'フットボールジグ', value: 'フットボールジグ' },
            { label: 'メタルバイブ', value: 'メタルバイブ' },
            { label: 'ウェイクベイト', value: 'ウェイクベイト' },
            { label: 'ポッパー', value: 'ポッパー' },
            { label: 'ペンシルベイト', value: 'ペンシルベイト' },
            { label: 'プロップベイト', value: 'プロップベイト' },
            { label: 'ハネモノ', value: 'ハネモノ' },
            { label: 'フロッグ', value: 'フロッグ' },
            { label: 'スモラバ', value: 'スモラバ' },
            { label: 'ネコリグ', value: 'ネコリグ' },
            { label: 'ミドスト', value: 'ミドスト' },
            { label: 'ノーシンカーリグ', value: 'ノーシンカーリグ' },
            { label: 'ジグヘッドワッキー', value: 'ジグヘッドワッキー' },
            { label: 'ダウンショットリグ', value: 'ダウンショットリグ' },
            { label: '虫系', value: '虫系' },
            { label: 'ヘビキャロ', value: 'ヘビキャロ' },
            { label: 'テキサスリグ', value: 'テキサスリグ' },
            { label: 'スイムベイト', value: 'スイムベイト' },
            { label: 'シャッドテール', value: 'シャッドテール' }
          ]}
          style={pickerSelectStyles}
          placeholder={{ label: 'ルアーを選択してください', value: null }}
        />
        <Text style={styles.textTitle}>ルアーカラー</Text>
        <RNPickerSelect
          onValueChange={(value: string | null) => {
            if (value !== null) {
              setLureColor(value)
            }
          }}
          items={[
            { label: 'ゴールド', value: 'ゴールド' },
            { label: 'シルバー', value: 'シルバー' },
            { label: 'レッド', value: 'レッド' },
            { label: 'ブルー', value: 'ブルー' },
            { label: 'チャート', value: 'チャート' },
            { label: 'パープル', value: 'パープル' },
            { label: 'ゴースト', value: 'ゴースト' },
            { label: 'ピンク', value: 'ピンク' },
            { label: 'ホワイト', value: 'ホワイト' },
            { label: 'ブラック', value: 'ブラック' },
            { label: 'クロー', value: 'クロー' },
            { label: 'ホロ', value: 'ホロ' },
            { label: 'インナープレート', value: 'インナープレート' },
            { label: 'クリア', value: 'クリア' },
            { label: 'ウォーターメロン', value: 'ウォーターメロン' },
            { label: 'グリパン', value: 'グリパン' },
            { label: 'スカッパノン', value: 'スカッパノン' },
            { label: 'スモーク', value: 'スモーク' },
            { label: 'ツートン', value: 'ツートン' }
          ]}
          style={pickerSelectStyles}
          placeholder={{ label: '釣果エリアを選択してください', value: null }}
        />
        <Text style={styles.textTitle}>釣果数</Text>
        <RNPickerSelect
          onValueChange={(value: number | null) => {
            if (value !== null) {
              setCatchFish(value)
            }
          }}
          items={generateCatchFishOptions()}
          style={pickerSelectStyles}
          placeholder={{ label: '釣果数を選択してください', value: null }}
        />
        <Button label='投稿' onPress={() => {
          void handlePress(
            title,
            images.map(img => img.uri),
            weather,
            content,
            length,
            weight,
            lure,
            lureColor,
            catchFish,
            fishArea
          )
        }}
          buttonStyle={{ width: '100%', marginTop: 8, alignItems: 'center', height: 30 }}
          labelStyle={{ fontSize: 24, lineHeight: 21 }}
        />
      </ScrollView>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8'
  },
  inner: {
    marginVertical: 24,
    marginHorizontal: 16
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 'bold',
    marginBottom: 24
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#D0D0D0',
    height: 32,
    marginVertical: 4,
    alignItems: 'flex-start',
    paddingLeft: 18,
    fontSize: 16
  },
  textTitle: {
    paddingVertical: 4
  },
  imageContainer: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 4,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  image: {
    width: 100,
    height: 100,
    margin: 6.5
  }
})

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 19,
    borderBottomWidth: 1,
    borderBottomColor: '#D0D0D0',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
    marginVertical: 4
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 19,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#D0D0D0',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30
  }
})

export default Create

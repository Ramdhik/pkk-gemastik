import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function UploadImageScreen() {
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const pickAndUpload = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Izin Ditolak', 'Tidak dapat mengakses galeri foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const uri = result.assets[0].uri;
      setImageUri(uri);
      setIsLoading(true);

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const arrayBuffer = decode(base64);
      const ext = uri.split('.').pop() || 'jpg';
      const filename = `${Date.now()}.${ext}`;
      const path = `posts/${filename}`;
      const contentType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;

      const { error } = await supabase.storage.from('posting').upload(path, arrayBuffer, {
        contentType,
        upsert: false,
      });

      if (error) {
        console.error('Gagal upload gambar:', error.message);
        throw error;
      }

      const { data } = supabase.storage.from('posting').getPublicUrl(path);
      setPublicUrl(data.publicUrl);
    } catch (err: any) {
      console.error('Terjadi error:', err.message);
      Alert.alert('Error', err.message || 'Gagal upload gambar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePost = async () => {
    if (!publicUrl || !content.trim()) {
      Alert.alert('Oops', 'Gambar dan content harus diisi.');
      return;
    }

    try {
      setIsLoading(true);
      setSuccessMessage(null); // clear dulu

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      const { error } = await supabase.from('posts').insert([
        {
          image: publicUrl,
          content,
          user_id: userId,
        },
      ]);

      if (error) {
        console.error('Gagal insert post:', error.message);
        Alert.alert('Error', 'Gagal menyimpan postingan.');
      } else {
        setContent('');
        setImageUri(null);
        setPublicUrl(null);
        setSuccessMessage('✅ Postingan berhasil dikirim!');
      }
    } catch (err: any) {
      console.error('Error saat insert:', err.message);
      Alert.alert('Error', err.message || 'Gagal menyimpan postingan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 p-6 mt-10 bg-pink-50">
      {/* Tombol Back */}
      <TouchableOpacity onPress={() => navigation.goBack()} className="absolute z-10 top-6 left-6">
        <Ionicons name="arrow-back" size={28} color="#EC4899" />
      </TouchableOpacity>

      <Text className="mb-6 text-2xl font-bold text-center text-pink-700">📸 Upload Postingan</Text>

      {/* Upload Area */}
      <TouchableOpacity onPress={pickAndUpload} disabled={isLoading} className="items-center justify-center w-full h-56 mb-6 bg-pink-100 border-2 border-pink-400 border-dashed shadow-md rounded-3xl">
        {imageUri ? (
          <Image source={{ uri: imageUri }} className="w-full h-full rounded-3xl" resizeMode="cover" />
        ) : (
          <View className="items-center">
            <Ionicons name="image-outline" size={40} color="#F472B6" />
            <Text className="mt-2 text-lg text-pink-600">Ketuk untuk pilih gambar</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Caption Input */}
      <TextInput
        className="w-full px-5 py-4 mb-6 text-lg text-gray-800 bg-white border-2 border-pink-300 shadow-sm rounded-2xl"
        placeholder="Tulis caption atau cerita kamu di sini..."
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={4}
      />

      {/* Tombol Posting */}
      <TouchableOpacity onPress={handlePost} className="flex-row items-center justify-center w-full py-4 mb-2 bg-pink-500 shadow-md rounded-3xl" disabled={isLoading || !publicUrl}>
        <Ionicons name="send" size={22} color="#fff" />
        <Text className="ml-2 text-lg font-bold text-white">Posting Sekarang</Text>
      </TouchableOpacity>

      {/* Notifikasi sukses */}
      {successMessage && <Text className="mt-2 font-medium text-center text-green-600">{successMessage}</Text>}

      {/* Loading */}
      {isLoading && <ActivityIndicator size="large" color="#EC4899" className="mt-4" />}
    </View>
  );
}

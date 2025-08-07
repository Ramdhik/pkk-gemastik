import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function UploadImageScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [content, setContent] = useState<string>(''); // ✅ State baru

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

  // ✅ Fungsi untuk posting ke database
  const handlePost = async () => {
    if (!publicUrl || !content.trim()) {
      Alert.alert('Oops', 'Gambar dan content harus diisi.');
      return;
    }

    try {
      setIsLoading(true);

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
        Alert.alert('Sukses', 'Postingan berhasil dibuat!');
        // Reset form
        setContent('');
        setImageUri(null);
        setPublicUrl(null);
      }
    } catch (err: any) {
      console.error('Error saat insert:', err.message);
      Alert.alert('Error', err.message || 'Gagal menyimpan postingan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="items-center justify-center flex-1 p-5 bg-white">
      <TouchableOpacity className="items-center justify-center w-full h-48 mb-4 bg-gray-200 border border-gray-400 rounded-xl" onPress={pickAndUpload} disabled={isLoading}>
        {imageUri ? <Image source={{ uri: imageUri }} className="w-full h-full rounded-xl" resizeMode="cover" /> : <Text className="text-gray-600">Pilih Gambar</Text>}
      </TouchableOpacity>

      {/* ✅ Input untuk content */}
      <TextInput className="w-full px-4 py-2 mb-4 text-base border border-gray-400 rounded-xl" placeholder="Tulis content..." value={content} onChangeText={setContent} multiline />

      {/* ✅ Tombol posting */}
      <TouchableOpacity onPress={handlePost} className="w-full py-3 mb-4 bg-pink-500 rounded-xl" disabled={isLoading || !publicUrl}>
        <Text className="font-semibold text-center text-white">Posting</Text>
      </TouchableOpacity>

      {isLoading && <ActivityIndicator size="large" color="#F75C9D" className="mb-4" />}
    </View>
  );
}

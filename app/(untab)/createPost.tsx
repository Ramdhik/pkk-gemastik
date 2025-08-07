import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function UploadImageScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  const pickAndUpload = async () => {
    try {
      console.log('Mengecek session Supabase...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Gagal mendapatkan session:', sessionError.message);
      } else {
        console.log('Session berhasil didapat:', sessionData);
      }
      console.log('Meminta izin akses galeri...');
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Izin Ditolak', 'Tidak dapat mengakses galeri foto.');
        return;
      }

      console.log('Membuka galeri...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        console.log('Pemilihan gambar dibatalkan.');
        return;
      }

      const uri = result.assets[0].uri;
      console.log('Gambar dipilih dengan URI:', uri);

      setImageUri(uri);
      setIsLoading(true);

      console.log('Membaca gambar sebagai base64...');
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('Mengonversi base64 ke ArrayBuffer...');
      const arrayBuffer = decode(base64);

      const ext = uri.split('.').pop() || 'jpg';
      const filename = `${Date.now()}.${ext}`;
      const path = `posts/${filename}`;
      const contentType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;

      console.log('Mengunggah gambar ke Supabase...');
      console.log('Path:', path);
      console.log('Content-Type:', contentType);

      const { error } = await supabase.storage.from('posting').upload(path, arrayBuffer, {
        contentType,
        upsert: false,
      });

      if (error) {
        console.error('Gagal upload gambar:', error.message);
        throw error;
      }

      console.log('Mengambil URL publik...');
      const { data } = supabase.storage.from('posting').getPublicUrl(path);
      console.log('Public URL:', data.publicUrl);

      setPublicUrl(data.publicUrl);
    } catch (err: any) {
      console.error('Terjadi error:', err.message);
      Alert.alert('Error', err.message || 'Gagal upload gambar.');
    } finally {
      setIsLoading(false);
      console.log('Selesai proses upload.');
    }
  };

  return (
    <View className="items-center justify-center flex-1 p-5 bg-white">
      <TouchableOpacity className="items-center justify-center w-full h-48 mb-4 bg-gray-200 border border-gray-400 rounded-xl" onPress={pickAndUpload} disabled={isLoading}>
        {imageUri ? <Image source={{ uri: imageUri }} className="w-full h-full rounded-xl" resizeMode="cover" /> : <Text className="text-gray-600">Pilih Gambar</Text>}
      </TouchableOpacity>

      {isLoading && <ActivityIndicator size="large" color="#F75C9D" className="mb-4" />}

      {publicUrl && <Text className="text-sm text-blue-600 underline">Gambar di-upload: {publicUrl}</Text>}
    </View>
  );
}

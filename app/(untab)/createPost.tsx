import { Ionicons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function CreatePostScreen() {
  // const [image, setImage] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   (async () => {
  //     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //     if (status !== 'granted') {
  //       Alert.alert('Izin Diperlukan', 'Aplikasi memerlukan akses ke galeri foto Anda untuk memilih gambar.');
  //     }
  //   })();
  // }, []);

  // const pickImage = async () => {
  //   try {
  //     let result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: ['images'],
  //       allowsEditing: true,
  //       aspect: [4, 3],
  //       quality: 0.8,
  //     });

  //     if (!result.canceled) {
  //       setImage(result.assets[0].uri);
  //     }
  //   } catch (error) {
  //     Alert.alert('Error', 'Gagal memilih gambar');
  //     console.error('Error picking image:', error);
  //   }
  // };

  // const uploadImage = async () => {
  //   if (!image) {
  //     Alert.alert('Gambar Diperlukan', 'Anda harus memilih gambar untuk diupload.');
  //     return;
  //   }

  //   setIsLoading(true);

  //   try {
  //     console.log('🚀 Starting image upload...');
  //     console.log('📱 Image URI:', image);

  //     // Check Supabase connection
  //     console.log('🔗 Checking Supabase connection...');
  //     const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  //     if (bucketsError) {
  //       console.error('❌ Supabase connection failed:', bucketsError);
  //       Alert.alert('Error', 'Tidak dapat terhubung ke Supabase. Periksa koneksi internet Anda.');
  //       return;
  //     }

  //     console.log('✅ Supabase connected. Available buckets:', buckets?.map(b => b.name));

  //     // Check if 'posting' bucket exists
  //     const postingBucket = buckets?.find(bucket => bucket.name === 'posting');
  //     if (!postingBucket) {
  //       console.error('❌ Bucket "posting" not found!');
  //       Alert.alert('Error', 'Bucket "posting" tidak ditemukan di Supabase Storage.');
  //       return;
  //     }

  //     console.log('✅ Bucket "posting" found:', postingBucket);

  //     // Convert image to blob
  //     const response = await fetch(image);
  //     const blob = await response.blob();

  //     console.log('📦 Blob size:', blob.size, 'bytes');
  //     console.log('📦 Blob type:', blob.type);

  //     // Generate file name
  //     const fileExt = image.split('.').pop()?.toLowerCase() || 'jpg';
  //     const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  //     const filePath = `posts/${fileName}`;

  //     console.log('📁 Uploading to bucket: posting');
  //     console.log('📁 File path:', filePath);
  //     console.log('📁 Content type:', `image/${fileExt}`);

  //     // Upload to Supabase Storage
  //     const { data, error } = await supabase.storage.from('posting').upload(filePath, blob, {
  //       contentType: `image/${fileExt}`,
  //       upsert: false,
  //     });

  //     if (error) {
  //       console.error('❌ Upload error:', error);
  //       console.error('❌ Error name:', error.name);
  //       console.error('❌ Error message:', error.message);
  //       console.error('❌ Error cause:', error.cause);
  //       console.error('❌ Full error object:', JSON.stringify(error, null, 2));
  //       Alert.alert('Error', `Upload gagal: ${error.message || 'Network request failed'}`);
  //       return;
  //     }

  //     console.log('✅ Upload successful!', data);

  //     // Get public URL
  //     const {
  //       data: { publicUrl },
  //     } = supabase.storage.from('posting').getPublicUrl(filePath);

  //     console.log('🔗 Public URL:', publicUrl);

  //     // Success
  //     Alert.alert('Berhasil!', 'Gambar berhasil diupload!', [
  //       {
  //         text: 'OK',
  //         onPress: () => {
  //           setImage(null);
  //           router.back();
  //         },
  //       },
  //     ]);
  //   } catch (error) {
  //     console.error('💥 Error:', error);
  //     console.error('💥 Error message:', error.message);
  //     console.error('💥 Error stack:', error.stack);
  //     Alert.alert('Error', 'Terjadi kesalahan. Silakan coba lagi.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const removeImage = () => {
  //   setImage(null);
  // };

  const createPost = async () => {
    if (!content.trim()) {
      Alert.alert('Content Diperlukan', 'Mohon tulis content untuk postingan Anda.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Starting post creation...');
      console.log('📝 Content:', content);

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('❌ Auth error:', userError);
        Alert.alert('Error', 'Gagal mendapatkan data user. Silakan login ulang.');
        return;
      }

      if (!user) {
        console.error('❌ User not authenticated');
        Alert.alert('Error', 'Anda harus login terlebih dahulu.');
        return;
      }

      console.log('✅ User authenticated:', user.id);

      // Create post data
      const postData = {
        user_id: user.id,
        content: content.trim(),
        image: '', // Empty string for now since we're not uploading images
      };

      console.log('📤 Inserting post data:', postData);

      // Insert post to database
      const { data, error } = await supabase.from('posts').insert([postData]).select();

      if (error) {
        console.error('❌ Database error:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        Alert.alert('Error', `Gagal menyimpan postingan: ${error.message}`);
        return;
      }

      console.log('✅ Post created successfully:', data);

      // Success
      Alert.alert('Berhasil!', 'Postingan Anda telah berhasil dibuat.', [
        {
          text: 'OK',
          onPress: () => {
            setContent('');
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error('💥 Error creating post:', error);
      Alert.alert('Error', 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-5 pt-12">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">Buat Postingan</Text>
          <View className="w-8" />
        </View>

        {/* Content Section */}
        <View className="mb-8">
          <Text className="mb-3 text-lg font-semibold text-gray-800">Content</Text>
          <TextInput
            className="w-full min-h-[200px] border border-gray-300 rounded-xl p-4 text-base text-gray-800 bg-gray-50"
            placeholder="Tulis content postingan Anda..."
            multiline
            numberOfLines={8}
            value={content}
            onChangeText={setContent}
            placeholderTextColor="#999"
            style={{ textAlignVertical: 'top' }}
            editable={!isLoading}
          />
          <Text className="mt-2 text-sm text-gray-500">{content.length}/1000 karakter</Text>
        </View>

        {/* Create Post Button */}
        <TouchableOpacity className={`py-4 px-8 rounded-xl items-center shadow-lg shadow-black/20 mb-8 ${isLoading || !content.trim() ? 'bg-gray-400' : 'bg-[#F75C9D]'}`} onPress={createPost} disabled={isLoading || !content.trim()}>
          {isLoading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#fff" className="mr-2" />
              <Text className="text-lg font-bold text-white">Membuat Postingan...</Text>
            </View>
          ) : (
            <Text className="text-lg font-bold text-white">Buat Postingan</Text>
          )}
        </TouchableOpacity>

        {/* Commented Image Section */}
        {/* <View className="mb-6">
          <Text className="mb-3 text-lg font-semibold text-gray-800">Foto</Text>
          <TouchableOpacity className="relative items-center justify-center w-full h-64 bg-gray-100 border border-gray-200 rounded-2xl" onPress={pickImage} disabled={isLoading}>
            {image ? (
              <>
                <Image source={{ uri: image }} className="w-full h-full rounded-2xl" resizeMode="cover" />
                <TouchableOpacity className="absolute p-1 rounded-full top-2 right-2 bg-black/50" onPress={removeImage}>
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </>
            ) : (
              <View className="items-center">
                <Ionicons name="camera-outline" size={50} color="#888" />
                <Text className="mt-2 text-base text-gray-600">Pilih Gambar</Text>
              </View>
            )}
          </TouchableOpacity>
        </View> */}
      </View>
    </ScrollView>
  );
}

// app/community/create.tsx
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateCommunity() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name) {
      return Alert.alert('Nama Grup Belum Diisi', 'Silakan isi dulu nama grupnya ya Bu 😊');
    }

    setLoading(true);

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      return Alert.alert('Belum Login', 'Silakan login dulu ya Bu untuk bisa membuat grup 😊');
    }

    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert({
        name,
        is_group: true,
      })
      .select()
      .single();

    if (chatError) {
      console.error(chatError);
      return Alert.alert('Gagal Membuat Grup', 'Maaf ya Bu, ada masalah saat membuat grup. Coba lagi sebentar lagi.');
    }

    await supabase.from('chat_participants').insert({
      chat_id: chat.id,
      user_id: user.id,
    });

    Alert.alert('🎉 Grup Berhasil Dibuat!', `Grup "${name}" siap digunakan ya Bu!`);
    router.replace('/community');
  };

  return (
    <View className="flex-1 px-6 py-8 bg-pink-50">
      {/* Tombol Kembali */}
      <TouchableOpacity onPress={() => router.back()} className="absolute z-10 p-2 mt-1 left-4 top-16">
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      <Text className="mt-12 mb-4 text-2xl font-bold text-center text-gray-800">Buat Grup Komunitas</Text>

      <Text className="mb-3 text-lg text-gray-700">Silakan isi nama grup komunitas yang ingin Ibu buat ya. Misalnya grup arisan atau kegiatan PKK 😊</Text>

      <TextInput className="px-5 py-3 mb-6 text-lg bg-white border border-gray-300 rounded-xl" placeholder="Contoh: Arisan RT 05" value={name} onChangeText={setName} />

      <TouchableOpacity onPress={handleCreate} disabled={loading} className={`py-4 rounded-full ${loading ? 'bg-gray-400' : 'bg-pink-600'}`}>
        <Text className="text-lg font-bold text-center text-white">{loading ? 'Sedang Membuat...' : ' Buat Grup Sekarang'}</Text>
      </TouchableOpacity>
    </View>
  );
}

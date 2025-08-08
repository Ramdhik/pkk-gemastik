// app/community/create.tsx
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateCommunity() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name) return Alert.alert('Nama grup belum diisi', 'Silakan isi nama grup terlebih dahulu ya Bu 😊');
    setLoading(true);

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return Alert.alert('Belum masuk', 'Silakan login dulu ya Bu untuk bisa membuat grup 😊');

    // 1. Masukkan ke tabel `chats`
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

    // 2. Tambahkan ibu sebagai anggota pertama
    await supabase.from('chat_participants').insert({
      chat_id: chat.id,
      user_id: user.id,
    });

    Alert.alert('Grup Berhasil Dibuat 🎉', `Grup "${name}" siap digunakan, Bu!`);
    router.replace('/community');
  };

  return (
    <View className="flex-1 px-4 py-6 mt-5 bg-white">
      <Text className="mb-4 text-3xl font-bold ">Buat Grup Komunitas</Text>

      <Text className="mb-2 text-base text-gray-700">Silakan isi nama grup komunitas yang ingin Ibu buat ya.</Text>

      <TextInput placeholder="Contoh: Arisan RT 05" className="px-4 py-3 mb-4 text-base border border-gray-300 rounded-xl" value={name} onChangeText={setName} />

      <TouchableOpacity onPress={handleCreate} disabled={loading} className={`py-3 rounded-xl ${loading ? 'bg-gray-400' : 'bg-pink-500'}`}>
        <Text className="text-lg font-semibold text-center text-white">{loading ? 'Sedang Membuat...' : 'Buat Grup Sekarang'}</Text>
      </TouchableOpacity>
    </View>
  );
}

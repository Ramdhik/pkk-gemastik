import { supabase } from '@/lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddEventScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [place, setPlace] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Judul wajib diisi');
      return;
    }

    const session = (await supabase.auth.getSession()).data.session;
    const user = session?.user;

    if (!user) {
      Alert.alert('Gagal mendapatkan user');
      return;
    }

    const { error } = await supabase.from('events').insert({
      title,
      description: description || null,
      event_date: date.toISOString(),
      created_by: user.id,
      place: place || null, // ✅ tambahkan kolom place
    });

    if (error) {
      Alert.alert('Gagal menambahkan acara', error.message);
    } else {
      Alert.alert('Sukses', 'Acara berhasil ditambahkan');
      router.back();
    }
  };

  return (
    <View className="flex-1 p-6 bg-gray-50">
      <Text className="mb-4 text-2xl font-bold text-gray-800">Tambah Acara Baru</Text>

      <Text className="mb-1 text-gray-700">Judul Acara</Text>
      <TextInput className="px-4 py-2 mb-4 bg-white border rounded-md" placeholder="Contoh: Pelatihan Kesehatan" value={title} onChangeText={setTitle} />

      <Text className="mb-1 text-gray-700">Deskripsi (opsional)</Text>
      <TextInput className="px-4 py-2 mb-4 bg-white border rounded-md" placeholder="Tulis deskripsi singkat" value={description} onChangeText={setDescription} />

      <Text className="mb-1 text-gray-700">Tempat</Text>
      <TextInput className="px-4 py-2 mb-4 bg-white border rounded-md" placeholder="Contoh: Aula RT, Balai Warga" value={place} onChangeText={setPlace} />

      <Text className="mb-1 text-gray-700">Tanggal</Text>
      <TouchableOpacity className="px-4 py-2 mb-4 bg-white border rounded-md" onPress={() => setShowDatePicker(true)}>
        <Text>{date.toLocaleDateString('id-ID')}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <TouchableOpacity className="items-center py-3 bg-pink-500 rounded-full" onPress={handleSubmit}>
        <Text className="text-base font-semibold text-white">Simpan Acara</Text>
      </TouchableOpacity>
    </View>
  );
}

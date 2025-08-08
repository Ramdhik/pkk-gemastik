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
      Alert.alert('Nama acara belum diisi');
      return;
    }

    const session = (await supabase.auth.getSession()).data.session;
    const user = session?.user;

    if (!user) {
      Alert.alert('Gagal mendapatkan data pengguna');
      return;
    }

    const { error } = await supabase.from('events').insert({
      title,
      description: description || null,
      event_date: date.toISOString(),
      created_by: user.id,
      place: place || null,
    });

    if (error) {
      Alert.alert('Gagal menyimpan acara', error.message);
    } else {
      Alert.alert('Berhasil', 'Acara sudah tersimpan');
      router.back();
    }
  };

  return (
    <View className="flex-1 p-6 bg-pink-50">
      <Text className="mt-10 mb-6 text-2xl font-bold text-center text-gray-800">Form Tambah Acara</Text>

      <Text className="mb-2 text-lg text-gray-700">Tuliskan Nama Acara*</Text>
      <TextInput className="px-5 py-3 mb-5 text-lg bg-white border border-gray-300 rounded-full" placeholder="Misal: Pengajian Rutin Ibu-Ibu" value={title} onChangeText={setTitle} />

      <Text className="mb-2 text-lg text-gray-700">Deskripsi Acara (boleh dikosongkan)</Text>
      <TextInput className="px-5 py-3 mb-5 text-lg bg-white border border-gray-300 rounded-full" placeholder="Contoh: Kegiatan pengajian setiap minggu..." value={description} onChangeText={setDescription} />

      <Text className="mb-2 text-lg text-gray-700">Lokasi Acara</Text>
      <TextInput className="px-5 py-3 mb-5 text-lg bg-white border border-gray-300 rounded-full" placeholder="Contoh: Balai Warga, Rumah Bu RT" value={place} onChangeText={setPlace} />

      <Text className="mb-2 text-lg text-gray-700">Tanggal Acara</Text>
      <TouchableOpacity className="px-5 py-3 mb-5 bg-white border border-gray-300 rounded-full" onPress={() => setShowDatePicker(true)}>
        <Text className="text-lg">{date.toLocaleDateString('id-ID')}</Text>
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

      <TouchableOpacity className="items-center py-4 bg-pink-600 rounded-full" onPress={handleSubmit}>
        <Text className="text-lg font-bold text-white">Simpan Acara</Text>
      </TouchableOpacity>
    </View>
  );
}

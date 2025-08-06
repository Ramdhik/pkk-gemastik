import { supabase } from '@/lib/supabase'; // Sesuaikan path jika beda
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export default function TabTwoScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(userError || 'No user found');
        return;
      }

      // Ambil email langsung dari auth.users
      setEmail(user.email || '');

      // Ambil full_name dari tabel profiles
      const { data, error } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();

      if (error) {
        console.error('Error fetching full_name:', error);
      } else {
        setFullName(data?.full_name || '');
      }
    };

    fetchProfile();
  }, []);

  const firstName = fullName?.split?.(' ')[0] || '';

  return (
    <View className="flex-1 px-5 bg-white pt-14">
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-2xl font-bold text-[#4b0b26]">Halo, {firstName}</Text>
          <Text className="text-base text-gray-500">{email}</Text>
        </View>
        <Pressable className="p-3 bg-pink-300 rounded-full">
          <Ionicons name="notifications" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Konten lainnya bisa kamu tambahkan di bawah sini */}
    </View>
  );
}

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function Account() {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [role, setRole] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [desaAsal, setDesaAsal] = useState('');
  const router = useRouter();

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);

      // Ambil user yang sedang login
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('❌ Error getting user:', userError);
        throw userError;
      }

      if (!user) {
        console.error('❌ No user found');
        Alert.alert('Error', 'No authenticated user found');
        return;
      }

      console.log('✅ Current user:', user.id, user.email);
      setEmail(user.email || '');

      // Ambil profile data
      const { data, error } = await supabase.from('profiles').select('full_name, avatar_url, role, birth_date, desa_asal').eq('id', user.id).single();

      if (error) {
        console.error('❌ Error fetching profile:', error);
        throw error;
      }

      console.log('✅ Profile data fetched from Supabase:', data);

      setFullName(data?.full_name || '');
      setAvatarUrl(data?.avatar_url || '');
      setRole(data?.role || '');
      setBirthDate(data?.birth_date || '');
      setDesaAsal(data?.desa_asal || '');
    } catch (error) {
      console.error('❌ Full error details:', error);
      if (error instanceof Error) {
        Alert.alert('Error', `Failed to load profile: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  }

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 px-6 pt-12 bg-white">
      {/* Avatar */}
      <View className="items-center mb-6">
        <Image
          source={{
            uri: avatarUrl || 'https://via.placeholder.com/100',
          }}
          className="w-24 h-24 mb-4 rounded-full"
        />
        <Text className="text-xl font-bold text-gray-900">{fullName}</Text>
        <Text className="text-sm text-gray-500">@{email}</Text>
      </View>

      {/* Profile Info */}
      <View className="mb-6 space-y-4">
        <View>
          <Text className="text-sm text-gray-600">Tanggal Lahir</Text>
          <Text className="text-base font-medium text-gray-800">{birthDate || '-'}</Text>
        </View>

        <View>
          <Text className="text-sm text-gray-600">Desa Asal</Text>
          <Text className="text-base font-medium text-gray-800">{desaAsal || '-'}</Text>
        </View>

        <View>
          <Text className="text-sm text-gray-600">Peran</Text>
          <Text className="text-base font-medium text-gray-800">{role || '-'}</Text>
        </View>
      </View>

      {/* Logout Button */}
      <View className="mt-8">
        <TouchableOpacity onPress={handleLogout} className="py-3 border border-red-500 rounded-lg bg-red-50">
          <Text className="font-semibold text-center text-red-500">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

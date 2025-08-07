import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(session?.user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [role, setRole] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [desaAsal, setDesaAsal] = useState('');

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, role, birth_date, desa_asal')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      console.log('✅ Profile data fetched from Supabase:', data);

      setFullName(data.full_name || '');
      setAvatarUrl(data.avatar_url || '');
      setRole(data.role || '');
      setBirthDate(data.birth_date || '');
      setDesaAsal(data.desa_asal || '');
    } catch (error) {
      if (error instanceof Error)
        Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
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
          <Text className="text-base font-medium text-gray-800">
            {birthDate || '-'}
          </Text>
        </View>

        <View>
          <Text className="text-sm text-gray-600">Desa Asal</Text>
          <Text className="text-base font-medium text-gray-800">
            {desaAsal || '-'}
          </Text>
        </View>

        <View>
          <Text className="text-sm text-gray-600">Peran</Text>
          <Text className="text-base font-medium text-gray-800">
            {role || '-'}
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View className="flex-row justify-between space-x-4">
        <TouchableOpacity
          onPress={() => Alert.alert('Edit Profile Coming Soon')}
          className="flex-1 py-3 bg-pink-500 rounded-lg"
        >
          <Text className="font-semibold text-center text-white">
            Edit Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => supabase.auth.signOut()}
          className="flex-1 py-3 border border-pink-500 rounded-lg"
        >
          <Text className="font-semibold text-center text-pink-500">
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

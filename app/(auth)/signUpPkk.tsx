import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function SignUpPkk() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [desaAsal, setDesaAsal] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleShowPassword = () => setShowPassword(!showPassword);

  async function signUp() {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      Alert.alert('Sign Up Error', error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (user) {
      const { error: insertError } = await supabase.from('users').upsert([
        {
          id: user.id,
          full_name: fullName,
          desa_asal: desaAsal,
          role: 'pkk',
        },
      ]);

      if (insertError) {
        Alert.alert('Data Error', insertError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    Alert.alert('Berhasil', 'Cek email untuk konfirmasi akun!');
    router.replace('/');
  }

  return (
    <View className="justify-center flex-1 px-6 bg-white">
      <Text className="mb-6 text-2xl font-bold text-center">Daftar - Anggota PKK</Text>

      <TextInput className="px-4 py-2 mb-4 border border-gray-300 rounded-md" placeholder="Nama Lengkap" value={fullName} onChangeText={setFullName} />
      <TextInput className="px-4 py-2 mb-4 border border-gray-300 rounded-md" placeholder="Desa Asal PKK" value={desaAsal} onChangeText={setDesaAsal} />
      <TextInput className="px-4 py-2 mb-4 border border-gray-300 rounded-md" placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

      <View className="flex-row items-center px-4 py-2 mb-6 border border-gray-300 rounded-md">
        <TextInput className="flex-1" placeholder="Password" secureTextEntry={!showPassword} autoCapitalize="none" value={password} onChangeText={setPassword} />
        <Pressable onPress={toggleShowPassword}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="gray" />
        </Pressable>
      </View>

      <TouchableOpacity className="p-3 bg-green-600 rounded-md" disabled={loading} onPress={signUp}>
        <Text className="font-semibold text-center text-white">{loading ? 'Loading...' : 'Daftar'}</Text>
      </TouchableOpacity>
    </View>
  );
}

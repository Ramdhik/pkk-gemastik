import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, AppState, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function SignIn() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      Alert.alert('Login Gagal', error.message);
    } else {
      Alert.alert('Sukses', 'Login berhasil!');
      router.replace('/'); // ✅ navigasi ke halaman utama
    }

    setLoading(false);
  }

  return (
    <View className="justify-center flex-1 px-6 bg-white">
      <Text className="mb-6 text-2xl font-bold text-center">Sign In</Text>

      <TextInput className="px-4 py-2 mb-4 border border-gray-300 rounded-md" placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />

      <View className="relative mb-6">
        <TextInput className="px-4 py-2 pr-10 border border-gray-300 rounded-md" placeholder="Password" secureTextEntry={!showPassword} autoCapitalize="none" value={password} onChangeText={setPassword} />
        <TouchableOpacity className="absolute right-3 top-3" onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#999" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity className="p-3 bg-blue-600 rounded-md" disabled={loading} onPress={signInWithEmail}>
        <Text className="font-semibold text-center text-white">{loading ? 'Loading...' : 'Sign In'}</Text>
      </TouchableOpacity>

      <TouchableOpacity className="mt-4" onPress={() => router.push('/(auth)/signUp')}>
        <Text className="text-center text-blue-500">Tidak punya akun? Daftar</Text>
      </TouchableOpacity>
    </View>
  );
}

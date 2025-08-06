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
      router.replace('/');
    }

    setLoading(false);
  }

  return (
    <View className="justify-center flex-1 px-6 bg-white">
      <Text className="text-center text-4xl font-extrabold text-[#4b0b26] mb-12">Selamat Datang</Text>

      <Text className="mb-2 text-lg font-semibold text-[#4b0b26]">Email</Text>
      <TextInput className="mb-5 rounded-full bg-pink-100 px-6 py-4 text-lg text-[#4b0b26]" placeholder="Ex: kamu@email.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />

      <Text className="mb-2 text-lg font-semibold text-[#4b0b26]">Password</Text>
      <View className="relative mb-6">
        <TextInput className="rounded-full bg-pink-100 px-6 py-4 pr-12 text-lg text-[#4b0b26]" placeholder="Masukkan Password" secureTextEntry={!showPassword} autoCapitalize="none" value={password} onChangeText={setPassword} />
        <TouchableOpacity className="absolute right-5 top-4" onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#4b0b26" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity className="py-4 bg-pink-500 rounded-full" disabled={loading} onPress={signInWithEmail}>
        <Text className="text-lg font-bold text-center text-white">{loading ? 'Loading...' : 'Masuk'}</Text>
      </TouchableOpacity>

      <TouchableOpacity className="mt-6" onPress={() => router.push('/(auth)/signUp')}>
        <Text className="text-base text-center text-gray-400">
          Belum punya akun? <Text className="font-bold text-black">Daftar</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

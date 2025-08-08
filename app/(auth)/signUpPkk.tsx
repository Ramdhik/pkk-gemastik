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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  const toggleShowPassword = () => setShowPassword(!showPassword);

  async function signUp() {
    if (!agree) {
      Alert.alert('Peringatan', 'Anda harus menyetujui syarat dan ketentuan.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Peringatan', 'Kata sandi dan konfirmasi tidak sama.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      Alert.alert('Sign Up Error', error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (user) {
      const { error: insertError } = await supabase.from('profiles').upsert([
        {
          id: user.id,
          full_name: fullName,
          desa_asal: desaAsal,
          avatar_url: 'https://i.pinimg.com/736x/9e/83/75/9e837528f01cf3f42119c5aeeed1b336.jpg',
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
    router.replace('/(tabs)');
  }

  return (
    <View className="flex-1 px-6 pt-16 bg-white">
      <Text className="mt-10 mb-10 text-3xl font-bold text-center text-pink-700">Ayo Daftar Sekarang</Text>

      <Text className="mb-2 text-base font-semibold text-pink-800">Nama Lengkap</Text>
      <View className="flex-row items-center px-4 mb-4 bg-pink-100 rounded-full h-14">
        <Ionicons name="person-outline" size={24} color="gray" />
        <TextInput className="flex-1 ml-3 text-base text-black" placeholder="Nama Lengkap" placeholderTextColor="#999" value={fullName} onChangeText={setFullName} />
      </View>

      <Text className="mb-2 text-base font-semibold text-pink-800">Desa Asal</Text>
      <View className="flex-row items-center px-4 mb-4 bg-pink-100 rounded-full h-14">
        <Ionicons name="home-outline" size={24} color="gray" />
        <TextInput className="flex-1 ml-3 text-base text-black" placeholder="Desa Asal" placeholderTextColor="#999" value={desaAsal} onChangeText={setDesaAsal} />
      </View>

      <Text className="mb-2 text-base font-semibold text-pink-800">Email</Text>
      <View className="flex-row items-center px-4 mb-4 bg-pink-100 rounded-full h-14">
        <Ionicons name="mail-outline" size={24} color="gray" />
        <TextInput className="flex-1 ml-3 text-base text-black" placeholder="Email" placeholderTextColor="#999" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      </View>

      <Text className="mb-2 text-base font-semibold text-pink-800">Kata Sandi</Text>
      <View className="flex-row items-center px-4 mb-4 bg-pink-100 rounded-full h-14">
        <Ionicons name="lock-closed-outline" size={24} color="gray" />
        <TextInput className="flex-1 ml-3 text-base text-black" placeholder="Password" placeholderTextColor="#999" secureTextEntry={!showPassword} autoCapitalize="none" value={password} onChangeText={setPassword} />
        <Pressable onPress={toggleShowPassword}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="gray" />
        </Pressable>
      </View>

      <Text className="mb-2 text-base font-semibold text-pink-800">Konfirmasi Kata Sandi</Text>
      <View className="flex-row items-center px-4 mb-6 bg-pink-100 rounded-full h-14">
        <Ionicons name="lock-closed-outline" size={24} color="gray" />
        <TextInput className="flex-1 ml-3 text-base text-black" placeholder="Konfirmasi Password" placeholderTextColor="#999" secureTextEntry={!showPassword} autoCapitalize="none" value={confirmPassword} onChangeText={setConfirmPassword} />
      </View>

      <View className="flex-row items-start gap-3 mb-6">
        <Pressable onPress={() => setAgree(!agree)}>
          <View className="items-center justify-center w-6 h-6 border-2 border-pink-500 rounded-full">{agree && <Ionicons name="checkmark" size={16} color="pink" />}</View>
        </Pressable>
        <Text className="flex-1 text-sm leading-relaxed text-black">Dengan ini saya menyatakan setuju terhadap seluruh syarat, ketentuan, dan kebijakan yang ditetapkan oleh aplikasi.</Text>
      </View>

      <TouchableOpacity className={`py-4 rounded-full ${agree ? 'bg-pink-600' : 'bg-pink-300'}`} disabled={!agree || loading} onPress={signUp}>
        <Text className="text-lg font-bold text-center text-white">{loading ? 'Loading...' : 'Daftar Sekarang'}</Text>
      </TouchableOpacity>
    </View>
  );
}

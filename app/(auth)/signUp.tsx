import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function SignUpRole() {
  const [role, setRole] = useState<'warga' | 'pkk' | null>(null);
  const router = useRouter();

  const handleNext = () => {
    if (!role) return;
    if (role === 'warga') router.push('/(auth)/signUpWarga');
    if (role === 'pkk') router.push('/(auth)/signUpPkk');
  };

  const goToSignIn = () => {
    router.push('/(auth)/signIn');
  };

  return (
    <View className="justify-center flex-1 px-6 bg-white">
      {/* Title */}
      <Text className="text-3xl font-bold text-center text-[#521B41] mb-10">Ayo Daftar Sekarang</Text>

      {/* Subheading */}
      <Text className="text-lg font-semibold text-[#521B41] mb-6">Apa Peran Kamu?</Text>

      {/* Option - Masyarakat */}
      <TouchableOpacity className="flex-row items-center mb-5" onPress={() => setRole('warga')}>
        <View className={`w-5 h-5 rounded-full border-2 mr-4 ${role === 'warga' ? 'border-pink-500' : 'border-gray-400'} items-center justify-center`}>{role === 'warga' && <View className="w-3 h-3 bg-pink-500 rounded-full" />}</View>
        <Text className="text-xl text-[#521B41]">Masyarakat</Text>
      </TouchableOpacity>

      {/* Option - Anggota PKK */}
      <TouchableOpacity className="flex-row items-center mb-10" onPress={() => setRole('pkk')}>
        <View className={`w-5 h-5 rounded-full border-2 mr-4 ${role === 'pkk' ? 'border-pink-500' : 'border-gray-400'} items-center justify-center`}>{role === 'pkk' && <View className="w-3 h-3 bg-pink-500 rounded-full" />}</View>
        <Text className="text-xl text-[#521B41]">Anggota PKK</Text>
      </TouchableOpacity>

      {/* Button */}
      <TouchableOpacity onPress={handleNext} disabled={!role} className={`rounded-full py-3 ${role ? 'bg-pink-500' : 'bg-pink-300'}`}>
        <Text className="text-xl font-semibold text-center text-white">Lanjutkan</Text>
      </TouchableOpacity>

      {/* Bottom text with link */}
      <View className="flex-row justify-center mt-6">
        <Text className="text-base text-gray-400">Sudah Punya Akun? </Text>
        <TouchableOpacity onPress={goToSignIn}>
          <Text className="font-bold text-[#521B41] text-base">Masuk</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

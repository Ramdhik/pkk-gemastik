import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function SignUpWarga() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  const toggleAgreement = () => setIsAgreed(!isAgreed);

  const onChangeDate = (event: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) {
      setSelectedDate(selected);
      const formatted = selected.toISOString().split('T')[0];
      setBirthDate(formatted);
    }
  };

  async function signUp() {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password dan konfirmasi password tidak cocok.');
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
          birth_date: birthDate,
          role: 'warga',
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

      {/* Nama */}
      <Text className="mb-2 text-base font-semibold text-pink-900">Nama Lengkap</Text>
      <View className="flex-row items-center px-4 mb-4 bg-pink-100 rounded-full h-14">
        <Ionicons name="person-outline" size={22} color="gray" />
        <TextInput className="flex-1 ml-2 text-base text-black" placeholder="Contoh: Indyeye" placeholderTextColor="#999" value={fullName} onChangeText={setFullName} />
      </View>

      {/* Tanggal Lahir */}
      <Text className="mb-2 text-base font-semibold text-pink-900">Tanggal Lahir</Text>
      <Pressable onPress={() => setShowDatePicker(true)} className="flex-row items-center px-4 mb-4 bg-pink-100 rounded-full h-14">
        <Ionicons name="calendar-outline" size={22} color="gray" />
        <Text className={`ml-2 text-base ${birthDate ? 'text-black' : 'text-gray-400'}`}>{birthDate || 'Contoh: 2003-01-01'}</Text>
      </Pressable>

      {showDatePicker && <DateTimePicker value={selectedDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onChangeDate} maximumDate={new Date()} />}

      {/* Email */}
      <Text className="mb-2 text-base font-semibold text-pink-900">Email</Text>
      <View className="flex-row items-center px-4 mb-4 bg-pink-100 rounded-full h-14">
        <Ionicons name="mail-outline" size={22} color="gray" />
        <TextInput className="flex-1 ml-2 text-base text-black" placeholder="Masukkan Email" placeholderTextColor="#999" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      </View>

      {/* Password */}
      <Text className="mb-2 text-base font-semibold text-pink-900">Kata Sandi</Text>
      <View className="flex-row items-center px-4 mb-4 bg-pink-100 rounded-full h-14">
        <Ionicons name="lock-closed-outline" size={22} color="gray" />
        <TextInput className="flex-1 ml-2 text-base text-black" placeholder="Masukkan Kata Sandi" placeholderTextColor="#999" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
        <Pressable onPress={toggleShowPassword}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="gray" />
        </Pressable>
      </View>

      {/* Konfirmasi Password */}
      <Text className="mb-2 text-base font-semibold text-pink-900">Ulangi Kata Sandi</Text>
      <View className="flex-row items-center px-4 mb-6 bg-pink-100 rounded-full h-14">
        <Ionicons name="lock-closed-outline" size={22} color="gray" />
        <TextInput className="flex-1 ml-2 text-base text-black" placeholder="Konfirmasi Kata Sandi" placeholderTextColor="#999" secureTextEntry={!showConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} />
        <Pressable onPress={toggleShowConfirmPassword}>
          <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="gray" />
        </Pressable>
      </View>

      {/* Checkbox dan syarat */}
      <Pressable onPress={toggleAgreement} className="flex-row items-start gap-2 mb-6">
        <View className="items-center justify-center w-5 h-5 border border-pink-400 rounded-full">{isAgreed && <Ionicons name="checkmark" size={14} color="pink" />}</View>
        <Text className="flex-1 text-sm text-black">Dengan ini saya menyatakan setuju terhadap seluruh syarat, ketentuan, dan kebijakan yang ditetapkan oleh aplikasi.</Text>
      </Pressable>

      {/* Tombol Daftar */}
      <TouchableOpacity className={`py-3 rounded-full ${isAgreed ? 'bg-pink-600' : 'bg-pink-300'}`} disabled={!isAgreed || loading} onPress={signUp}>
        <Text className="text-lg font-bold text-center text-white">{loading ? 'Loading...' : 'Daftar'}</Text>
      </TouchableOpacity>
    </View>
  );
}

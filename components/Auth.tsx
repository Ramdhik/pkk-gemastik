import React, { useState } from 'react';
import { Alert, AppState, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    if (!session) Alert.alert('Please check your inbox for email verification!');
    setLoading(false);
  }

  return (
    <View className="px-4 mt-10">
      <View className="mb-4">
        <Text className="mb-1 text-white">Email</Text>
        <TextInput className="px-3 py-2 text-black bg-white border border-gray-300 rounded" onChangeText={setEmail} value={email} placeholder="email@address.com" autoCapitalize="none" keyboardType="email-address" />
      </View>
      <View className="mb-4">
        <Text className="mb-1 text-white">Password</Text>
        <TextInput className="px-3 py-2 text-black bg-white border border-gray-300 rounded" onChangeText={setPassword} value={password} placeholder="Password" autoCapitalize="none" secureTextEntry />
      </View>
      <TouchableOpacity className={`bg-blue-500 rounded py-3 mb-3 ${loading && 'opacity-50'}`} onPress={signInWithEmail} disabled={loading}>
        <Text className="font-semibold text-center text-white">Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity className={`bg-green-500 rounded py-3 ${loading && 'opacity-50'}`} onPress={signUpWithEmail} disabled={loading}>
        <Text className="font-semibold text-center text-white">Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

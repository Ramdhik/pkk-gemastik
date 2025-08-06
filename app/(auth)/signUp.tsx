// import React, { useState } from 'react';
// import {
//   Alert,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   Pressable,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { supabase } from '../../lib/supabase';

// export default function SignUp() {
//   const router = useRouter();

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [fullName, setFullName] = useState('');
//   const [username, setUsername] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const toggleShowPassword = () => setShowPassword(!showPassword);

//   async function signUpWithEmail() {
//     if (username.length < 3) {
//       Alert.alert('Error', 'Username must be at least 3 characters');
//       return;
//     }

//     setLoading(true);

//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//     });

//     if (error) {
//       Alert.alert('Sign Up Error', error.message);
//       setLoading(false);
//       return;
//     }

//     // ✅ Insert data ke table `profiles`
//     const user = data.user;
//     if (user) {
//       const { error: insertError } = await supabase.from('profiles').upsert([
//         {
//           id: user.id,
//           username,
//           full_name: fullName,
//           avatar_url: '', // default kosong
//         },
//       ]);

//       if (insertError) {
//         Alert.alert('Profile Error', insertError.message);
//         setLoading(false);
//         return;
//       }
//     }

//     setLoading(false);
//     Alert.alert('Success', 'Check your email to confirm your account!');
//     router.replace('/'); // Arahkan ke home page
//   }

//   return (
//     <View className="justify-center flex-1 px-6 bg-white">
//       <Text className="mb-6 text-2xl font-bold text-center">Sign Up</Text>

//       <TextInput
//         className="px-4 py-2 mb-4 border border-gray-300 rounded-md"
//         placeholder="Full Name"
//         value={fullName}
//         onChangeText={setFullName}
//       />
//       <TextInput
//         className="px-4 py-2 mb-4 border border-gray-300 rounded-md"
//         placeholder="Username"
//         autoCapitalize="none"
//         value={username}
//         onChangeText={setUsername}
//       />
//       <TextInput
//         className="px-4 py-2 mb-4 border border-gray-300 rounded-md"
//         placeholder="Email"
//         keyboardType="email-address"
//         autoCapitalize="none"
//         value={email}
//         onChangeText={setEmail}
//       />

//       <View className="flex-row items-center px-4 py-2 mb-6 border border-gray-300 rounded-md">
//         <TextInput
//           className="flex-1"
//           placeholder="Password"
//           secureTextEntry={!showPassword}
//           autoCapitalize="none"
//           value={password}
//           onChangeText={setPassword}
//         />
//         <Pressable onPress={toggleShowPassword}>
//           <Ionicons
//             name={showPassword ? 'eye-off' : 'eye'}
//             size={22}
//             color="gray"
//           />
//         </Pressable>
//       </View>

//       <TouchableOpacity
//         className="p-3 bg-green-600 rounded-md"
//         disabled={loading}
//         onPress={signUpWithEmail}
//       >
//         <Text className="font-semibold text-center text-white">
//           {loading ? 'Loading...' : 'Sign Up'}
//         </Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         className="mt-4"
//         onPress={() => router.push('/(auth)/signIn')}
//       >
//         <Text className="text-center text-blue-500">
//           Already have an account? Sign In
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
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
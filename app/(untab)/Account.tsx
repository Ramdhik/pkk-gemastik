import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (session) getUser();
  }, [session]);

  async function getUser() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error, status } = await supabase.from('users').select(`username, website, avatar_url`).eq('id', session?.user.id).single();

      if (error && status !== 406) throw error;

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateUser({ username, website, avatar_url }: { username: string; website: string; avatar_url: string }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('users').upsert(updates);

      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="px-4 mt-10">
      <View className="mb-4">
        <Text className="mb-1 text-white">Email</Text>
        <TextInput className="px-3 py-2 text-black bg-gray-100 border border-gray-300 rounded" value={session?.user?.email || ''} editable={false} />
      </View>

      <View className="mb-4">
        <Text className="mb-1 text-white">Username</Text>
        <TextInput className="px-3 py-2 text-black bg-white border border-gray-300 rounded" onChangeText={setUsername} value={username} placeholder="Enter username" />
      </View>

      <View className="mb-4">
        <Text className="mb-1 text-white">Website</Text>
        <TextInput className="px-3 py-2 text-black bg-white border border-gray-300 rounded" onChangeText={setWebsite} value={website} placeholder="Enter website" />
      </View>

      <TouchableOpacity className={`bg-blue-500 rounded py-3 mb-3 ${loading && 'opacity-50'}`} onPress={() => updateUser({ username, website, avatar_url: avatarUrl })} disabled={loading}>
        <Text className="font-semibold text-center text-white">{loading ? 'Loading...' : 'Update'}</Text>
      </TouchableOpacity>

      <TouchableOpacity className="py-3 bg-red-500 rounded" onPress={() => supabase.auth.signOut()}>
        <Text className="font-semibold text-center text-white">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

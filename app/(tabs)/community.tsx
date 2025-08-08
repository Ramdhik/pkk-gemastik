import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CommunityScreen() {
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return;
    setUserId(user.id);

    const { data: joinedGroupIds } = await supabase.from('chat_participants').select('chat_id').eq('user_id', user.id);
    const ids = joinedGroupIds?.map((g) => g.chat_id) || [];

    let myGroupList: any[] = [];
    if (ids.length > 0) {
      const { data: joinedGroups } = await supabase.from('chats').select('id, name').in('id', ids);

      // Ambil pesan terakhir per grup
      const { data: lastMessages } = await supabase.from('messages').select('chat_id, content, created_at').in('chat_id', ids).order('created_at', { ascending: false });

      const lastMessageMap = new Map();
      lastMessages?.forEach((msg) => {
        if (!lastMessageMap.has(msg.chat_id)) {
          lastMessageMap.set(msg.chat_id, msg.content);
        }
      });

      myGroupList =
        joinedGroups?.map((g) => ({
          id: g.id,
          name: g.name,
          lastMessage: lastMessageMap.get(g.id) || 'Belum ada pesan',
        })) || [];
    }

    setMyGroups(myGroupList);

    const { data: allGroups } = await supabase.from('chats').select('id, name').eq('is_group', true);
    const joinedIds = new Set(myGroupList.map((g) => g.id));
    const recommendList = allGroups?.filter((g) => !joinedIds.has(g.id)) || [];

    const { data: allParticipants } = await supabase.from('chat_participants').select('chat_id');
    const countsMap = new Map();
    allParticipants?.forEach((p) => {
      countsMap.set(p.chat_id, (countsMap.get(p.chat_id) || 0) + 1);
    });

    const enrichedRecs = recommendList.map((g) => ({
      ...g,
      members: countsMap.get(g.id) || 0,
    }));

    setRecommendations(enrichedRecs);
    setLoading(false);
  };

  const handleJoin = async (group: any) => {
    if (!userId) return;
    Alert.alert('Gabung Komunitas', `Yakin ingin bergabung dengan grup "${group.name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Gabung',
        onPress: async () => {
          const { error } = await supabase.from('chat_participants').insert({
            user_id: userId,
            chat_id: group.id,
          });

          if (!error) {
            setMyGroups([...myGroups, { id: group.id, name: group.name, lastMessage: '' }]);
            setRecommendations(recommendations.filter((g) => g.id !== group.id));
          }
        },
      },
    ]);
  };

  const handleGroupPress = (group: any) => {
    router.push(`/(untab)/community/${group.id}`);
  };

  const renderAvatar = (name: string) => {
    const firstLetter = name?.charAt(0)?.toUpperCase() || '?';
    return (
      <View className="items-center justify-center w-12 h-12 mr-4 bg-pink-200 rounded-full">
        <Text className="text-xl font-bold text-pink-800">{firstLetter}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 px-4 py-6 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between mt-6 mb-6">
        <TouchableOpacity onPress={() => router.push('/(untab)/community/createCommunity')}>
          <View className="items-center justify-center w-10 h-10 bg-pink-200 rounded-full">
            <Text className="text-xl text-pink-600">＋</Text>
          </View>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-black">Komunitas PKK</Text>
        <View className="w-10" />
      </View>

      {/* Search */}
      <TextInput placeholder="Cari komunitas PKK lain..." placeholderTextColor="#666" className="px-4 py-3 mb-6 text-lg text-black bg-pink-100 rounded-full" />

      {/* Grup Saya */}
      {myGroups.length > 0 && (
        <>
          <Text className="mb-2 text-xl font-bold text-black">Grup Saya</Text>
          {myGroups.map((group) => (
            <TouchableOpacity key={group.id} onPress={() => handleGroupPress(group)} className="flex-row items-center p-4 mb-3 border border-pink-200 shadow-sm bg-pink-50 rounded-xl">
              {renderAvatar(group.name)}
              <View className="flex-1">
                <Text className="text-lg font-bold text-black">{group.name}</Text>
                <Text className="text-base text-gray-500">{group.lastMessage || 'Belum ada pesan'}</Text>
              </View>
              <Feather name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Rekomendasi Komunitas */}
      {recommendations.length > 0 && (
        <>
          <Text className="mt-4 mb-2 text-xl font-bold text-black">Rekomendasi Komunitas</Text>
          {recommendations.map((group) => (
            <View key={group.id} className="flex-row items-center justify-between p-4 mb-20 bg-white border border-gray-200 shadow-sm rounded-xl">
              <View className="flex-row items-center">
                {renderAvatar(group.name)}
                <View>
                  <Text className="text-lg font-bold text-black">{group.name}</Text>
                  <Text className="text-base text-gray-600">{group.members} anggota</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleJoin(group)} className="px-4 py-2 bg-pink-500 rounded-full">
                <Text className="text-base font-semibold text-white">Gabung</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

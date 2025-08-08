import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

dayjs.locale('id');

export default function GroupDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [group, setGroup] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      setUserId(user.id);

      const { data: groupData } = await supabase.from('chats').select('*').eq('id', id).single();
      setGroup(groupData);

      const { data: msgs } = await supabase.from('messages').select('id, content, created_at, sender_id').eq('chat_id', id).order('created_at', { ascending: true });

      const uniqueSenderIds = Array.from(new Set(msgs?.map((m) => m.sender_id))).filter(Boolean);
      const { data: profileList } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', uniqueSenderIds);

      const profileMap: Record<string, any> = {};
      profileList?.forEach((p) => {
        profileMap[p.id] = p;
      });

      setMessages(msgs || []);
      setProfiles(profileMap);
    };

    fetchData();

    const channel = supabase
      .channel('room-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;

    await supabase.from('messages').insert({
      chat_id: id,
      sender_id: userId,
      content: newMessage.trim(),
    });

    setNewMessage('');
  };

  const renderItem = ({ item }: { item: any }) => {
    const isMe = item.sender_id === userId;
    const sender = profiles[item.sender_id];
    const time = dayjs(item.created_at).format('HH.mm');

    return (
      <View className={`mb-3 ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && (
          <View className="flex-row items-center mb-1">
            <Image source={{ uri: sender?.avatar_url || 'https://ui-avatars.com/api/?name=User' }} className="w-8 h-8 mr-2 rounded-full" />
            <Text className="text-xs font-bold text-pink-600">{sender?.full_name || 'User'}</Text>
          </View>
        )}
        <View className={`max-w-[80%] px-4 py-2 rounded-lg ${isMe ? 'bg-pink-200' : 'bg-gray-100'}`}>
          <Text className="text-sm text-black">{item.content}</Text>
        </View>
        <Text className="text-[10px] text-gray-400 mt-1">{time}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-black">{group?.name || 'Grup'}</Text>
      </View>

      {/* Chat messages */}
      <FlatList data={messages} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={{ padding: 16 }} />

      {/* Input pesan */}
      <View className="flex-row items-center p-4 bg-white border-t border-gray-200">
        <TextInput placeholder="Tulis pesan..." className="flex-1 px-4 py-2 text-base text-gray-800 bg-pink-100 rounded-full" value={newMessage} onChangeText={setNewMessage} />
        <TouchableOpacity onPress={sendMessage} className="items-center justify-center w-10 h-10 ml-2 bg-pink-500 rounded-full">
          <Text className="text-xl text-white">➤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

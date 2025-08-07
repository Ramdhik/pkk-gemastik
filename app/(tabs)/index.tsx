import PostCard from '@/components/(postCard)/PostCard';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

export default function TabTwoScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(userError || 'No user found');
        return;
      }

      setEmail(user.email || '');

      const { data, error } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();

      if (error) {
        console.error('Error fetching full_name:', error);
      } else {
        setFullName(data?.full_name || '');
      }
    };

    const fetchPosts = async () => {
      const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        const postsWithProfile = await Promise.all(
          data.map(async (post) => {
            const { data: profileData, error: profileError } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', post.user_id).single();

            if (profileError) {
              console.error('Error fetching profile for user_id:', post.user_id, profileError);
              return {
                ...post,
                full_name: 'Unknown User',
                avatar_url: 'https://via.placeholder.com/40',
              };
            }

            return {
              ...post,
              full_name: profileData?.full_name || 'Unknown User',
              avatar_url: profileData?.avatar_url || 'https://via.placeholder.com/40',
            };
          })
        );
        setPosts(postsWithProfile);
      }
    };

    const subscribeToNewPosts = () => {
      const channel = supabase
        .channel('public:posts')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
          const newPost = payload.new;

          const fetchProfileForNewPost = async () => {
            const { data: profileData, error: profileError } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', newPost.user_id).single();

            if (profileError) {
              console.error('Error fetching profile for new post:', profileError);
              return {
                ...newPost,
                full_name: 'Unknown User',
                avatar_url: 'https://via.placeholder.com/40',
              };
            }

            return {
              ...newPost,
              full_name: profileData?.full_name || 'Unknown User',
              avatar_url: profileData?.avatar_url || 'https://via.placeholder.com/40',
            };
          };

          fetchProfileForNewPost().then((postWithProfile) => {
            setPosts((prevPosts) => [postWithProfile, ...prevPosts]);
          });
        })
        .subscribe((status) => {
          console.log('📡 Realtime subscription status:', status);
        });

      return channel;
    };

    fetchProfile();
    fetchPosts();
    const channel = subscribeToNewPosts();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const firstName = fullName?.split?.(' ')[0] || '';

  return (
    <View className="flex-1 px-5 bg-white pt-14">
      <View className="flex-row items-center justify-between mb-6">
        <Pressable onPress={() => router.push('/account')}>
          <View>
            <Text className="text-2xl font-bold text-[#4b0b26]">Halo, {firstName}</Text>
            <Text className="text-base text-gray-500">{email}</Text>
          </View>
        </Pressable>
        <Pressable className="p-3 bg-pink-300 rounded-full">
          <Ionicons name="notifications" size={20} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PostCard id={item.id} user_id={item.user_id} content={item.content} avatar_url={item.avatar_url} image={item.image} created_at={item.created_at} full_name={item.full_name} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

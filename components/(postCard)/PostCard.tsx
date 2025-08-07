import { supabase } from '@/lib/supabase'; // pastikan path ini sesuai
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ProfileHeader from './ProfileHeader';

interface PostCardProps {
  id: string;
  user_id: string;
  content: string;
  image: string;
  created_at: string;
  full_name: string;
  avatar_url: string;
}

const PostCard = ({ id, user_id, content, image, created_at, full_name, avatar_url }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  const MAX_CONTENT_LENGTH = 100;
  const shouldShowSeeMore = content.length > MAX_CONTENT_LENGTH;
  const displayContent = showFullContent || !shouldShowSeeMore ? content : content.substring(0, MAX_CONTENT_LENGTH) + '...';

  // Fetch komentar sesuai post_id
  const fetchComments = async () => {
    const { data, error } = await supabase.from('comments').select(`id, content, created_at, profiles(full_name, avatar_url)`).eq('post_id', id).order('created_at', { ascending: false });

    if (!error) setComments(data || []);
  };

  // Submit komentar
  const handleSubmitComment = async () => {
    if (!comment.trim()) return;

    const { error } = await supabase.from('comments').insert({
      content: comment,
      post_id: id,
      user_id,
    });

    if (!error) {
      setComment('');
      fetchComments();
    }
  };

  useEffect(() => {
    if (isModalVisible) {
      fetchComments();
    }
  }, [isModalVisible]);

  return (
    <View className="p-4 mb-4 bg-white rounded-lg shadow-md">
      <ProfileHeader full_name={full_name} created_at={created_at} avatar_url={avatar_url} />

      <Image source={{ uri: image }} className="w-full h-64 mb-2 rounded-lg" />

      <View className="flex-row items-center gap-5 mb-2 space-x-4">
        <TouchableOpacity onPress={() => setIsLiked(!isLiked)}>
          <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={30} color={isLiked ? '#ef4444' : '#6b7280'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <Ionicons name="chatbubble-outline" size={28} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={28} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View>
        <Text className="text-gray-700">
          {displayContent}
          {shouldShowSeeMore && !showFullContent && (
            <TouchableOpacity onPress={() => setShowFullContent(true)}>
              <Text className="font-bold text-grey-500"> See more</Text>
            </TouchableOpacity>
          )}
          {showFullContent && shouldShowSeeMore && (
            <TouchableOpacity onPress={() => setShowFullContent(false)}>
              <Text className="font-bold text-grey-500"> See less</Text>
            </TouchableOpacity>
          )}
        </Text>
      </View>

      {/* Modal Komentar */}
      <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <View className="justify-end flex-1 bg-black/50">
          <View className="h-full p-4 bg-white">
            <Pressable onPress={() => setIsModalVisible(false)} className="mb-4">
              <Ionicons name="arrow-back" size={24} color="black" />
            </Pressable>

            <Text className="text-lg font-bold">Comments</Text>

            <ScrollView className="flex-1 mt-4">
              {comments.length === 0 ? (
                <Text className="text-gray-500">Belum ada yang berkomentar</Text>
              ) : (
                comments.map((comment) => (
                  <View key={comment.id} className="flex-row gap-3 mb-4 space-x-2">
                    <Image source={{ uri: comment.profiles?.avatar_url || 'https://placehold.co/40' }} className="w-10 h-10 rounded-full" />
                    <View className="flex-1">
                      <Text className="font-semibold">{comment.profiles?.full_name || 'User'}</Text>
                      <Text className="text-gray-600">{comment.content}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Input komentar */}
            <View className="flex-row items-center mt-4">
              <TextInput value={comment} onChangeText={setComment} placeholder="Tulis komentar..." className="flex-1 px-4 py-2 mr-2 bg-gray-100 rounded-full" />
              <TouchableOpacity onPress={handleSubmitComment}>
                <Ionicons name="send" size={24} color="#F472B6" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PostCard;

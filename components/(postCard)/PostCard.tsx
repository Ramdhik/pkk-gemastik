// PostCard.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import ProfileHeader from './ProfileHeader'; // Sesuaikan path impor

interface PostCardProps {
  id: string;
  user_id: string;
  content: string;
  image: string;
  created_at: string;
  full_name: string; // Tambahkan properti full_name
}

const PostCard = ({ id, user_id, content, image, created_at, full_name }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const MAX_CONTENT_LENGTH = 100; // Adjust as needed
  const shouldShowSeeMore = content.length > MAX_CONTENT_LENGTH;
  const displayContent = showFullContent || !shouldShowSeeMore ? content : content.substring(0, MAX_CONTENT_LENGTH) + '...';

  return (
    <View className="p-4 mb-4 bg-white rounded-lg shadow-md">
      {/* Header menggunakan komponen terpisah dengan full_name */}
      <ProfileHeader full_name={full_name} created_at={created_at} />

      {/* Post Image */}
      <Image source={{ uri: image }} className="w-full h-64 mb-2 rounded-lg" />

      {/* Action Buttons */}
      <View className="flex-row items-center gap-5 mb-2 space-x-4 ">
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

      {/* Content */}
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

      {/* Comments Modal */}
      <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <View className="justify-end flex-1 bg-black/50">
          <View className="h-full p-4 bg-white rounded-t-2xl">
            <Pressable onPress={() => setIsModalVisible(false)} className="mb-4">
              <Ionicons name="arrow-back" size={24} color="black" />
            </Pressable>
            <Text className="text-lg font-bold">Comments</Text>
            <Text className="mt-4 text-gray-500">Belum ada yang berkomentar</Text>
            {/* Add comment input or list here */}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PostCard;

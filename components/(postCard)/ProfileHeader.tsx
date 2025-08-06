// ProfileHeader.tsx
import React from 'react';
import { Image, Text, View } from 'react-native';

interface ProfileHeaderProps {
  full_name: string;
  created_at: string;
}

const ProfileHeader = ({ full_name, created_at }: ProfileHeaderProps) => {
  return (
    <View className="flex-row items-center mb-2">
      <Image source={{ uri: 'https://via.placeholder.com/40' }} className="w-10 h-10 mr-2 rounded-full" />
      <View>
        <Text className="text-lg font-bold">{full_name || 'Unknown User'}</Text>
        <Text className="text-sm text-gray-500">{new Date(created_at).toLocaleDateString()}</Text>
      </View>
    </View>
  );
};

export default ProfileHeader;

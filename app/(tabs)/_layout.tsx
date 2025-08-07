import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

export default function TabLayout() {
  const router = useRouter();

  const handleCreatePost = () => {
    router.push('/createPost');
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#fff',
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: '#F75C9D',
            marginHorizontal: 10,
            marginBottom: 20,
            borderRadius: 9999,
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 5,
            elevation: 5,
          },
          tabBarItemStyle: {
            borderRadius: 20,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Beranda',
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="shop"
          options={{
            title: 'Shop',
            tabBarIcon: ({ color, size }) => <Ionicons name="storefront" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Komunitas',
            tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="schedule"
          options={{
            title: 'Jadwal',
            tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
          }}
        />
      </Tabs>

      {/* Modern Gradient Floating Button */}
      <TouchableOpacity
        onPress={handleCreatePost}
        style={{
          position: 'absolute',
          bottom: 100,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: 32.5,
          backgroundColor: '#F75C9D',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

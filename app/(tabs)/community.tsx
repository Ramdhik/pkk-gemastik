import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

const groupList = [
  {
    id: '1',
    name: 'Grup PKK Desa A',
    message: 'Reva: Ibu - ibu ayo besok kita kumpul di-',
    img: 'https://via.placeholder.com/40',
  },
  {
    id: '2',
    name: 'Grup PKK Desa B',
    message: 'Reva: Ibu - ibu ayo besok kita kumpul di-',
    img: 'https://via.placeholder.com/40',
  },
  {
    id: '3',
    name: 'Grup PKK Desa C',
    message: 'Reva: Ibu - ibu ayo besok kita kumpul di-',
    img: 'https://via.placeholder.com/40',
  },
  {
    id: '4',
    name: 'Grup PKK Desa D',
    message: 'Reva: Ibu - ibu ayo besok kita kumpul di-',
    img: 'https://via.placeholder.com/40',
  },
];

const recommended = [
  {
    id: '1',
    name: 'Grup PKK Desa D',
    members: '15 Anggota',
    img: 'https://via.placeholder.com/40',
  },
  {
    id: '2',
    name: 'Grup PKK Desa C',
    members: '15 Anggota',
    img: 'https://via.placeholder.com/40',
  },
];

export default function CommunityScreen() {
  return (
    <ScrollView className="px-4 py-6 bg-white">
      {/* Search Bar */}
      <TextInput placeholder="Cari Komunitas PKK Lain" placeholderTextColor="#999" className="px-4 py-3 mb-6 text-sm text-gray-700 bg-pink-200 rounded-full" />

      {/* Grup List */}
      {groupList.map((group) => (
        <View key={group.id} className="flex-row items-center p-3 mb-3 bg-white shadow-sm rounded-xl" style={{ elevation: 2 }}>
          <Image source={{ uri: group.img }} className="w-10 h-10 mr-3 rounded-full" />
          <View className="flex-1">
            <Text className="text-sm font-bold">{group.name}</Text>
            <Text className="text-xs text-gray-500">{group.message}</Text>
          </View>
        </View>
      ))}

      {/* Rekomendasi Komunitas */}
      <Text className="mt-6 mb-3 text-base font-bold">Rekomendasi Komunitas</Text>

      {recommended.map((item) => (
        <View key={item.id} className="flex-row items-center justify-between p-3 mb-3 bg-white shadow-sm rounded-xl" style={{ elevation: 2 }}>
          <View className="flex-row items-center">
            <Image source={{ uri: item.img }} className="w-10 h-10 mr-3 rounded-full" />
            <View>
              <Text className="text-sm font-bold">{item.name}</Text>
              <Text className="text-xs text-gray-500">{item.members}</Text>
            </View>
          </View>
          <Pressable className="px-4 py-1 bg-pink-500 rounded-full">
            <Text className="text-xs font-semibold text-white">Gabung</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

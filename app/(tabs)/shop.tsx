import { FlatList, ScrollView, Text, TextInput, View } from 'react-native';

const categories = ['Lorem', 'Lorem', 'Lorem', 'Lorem'];
const products = [
  { id: '1', name: 'Lorem Ipsum', price: 15000 },
  { id: '2', name: 'Lorem Ipsum', price: 15000 },
  { id: '3', name: 'Lorem Ipsum', price: 15000 },
  { id: '4', name: 'Lorem Ipsum', price: 15000 },
];

// const screenWidth = Dimensions.get('window').width;
// const itemWidth = (screenWidth - 24 * 2 - 16) / 2; // padding + gap

export default function ExploreScreen() {
  return (
    <ScrollView className="px-6 pt-6 bg-white">
      {/* Search Bar */}
      <TextInput placeholder="Cari Produk yang Kamu Inginkan" placeholderTextColor="#999" className="px-4 py-3 mb-6 text-sm bg-gray-100 rounded-full" />

      {/* Header Kategori */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-bold">Kategori Produk</Text>
        <Text className="text-xs font-semibold text-pink-500">Lihat Selengkapnya</Text>
      </View>

      {/* List Kategori */}
      <FlatList
        data={categories}
        horizontal
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ gap: 12, marginBottom: 24 }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="items-center w-[60px]">
            <View className="w-[60px] h-[60px] bg-gray-200 rounded-xl mb-1" />
            <Text className="text-xs text-center">{item}</Text>
          </View>
        )}
      />

      {/* Untuk Kamu */}
      <Text className="mb-3 text-base font-bold">Untuk Kamu</Text>

      {/* Grid Produk */}
      <View className="flex-row flex-wrap justify-between pb-8 gap-y-4">
        {products.map((item) => (
          <View key={item.id} className="bg-white rounded-xl p-3 shadow-sm w-[47%]" style={{ elevation: 3 }}>
            <View className="mb-2 bg-gray-200 aspect-square rounded-xl" />
            <Text className="text-sm font-semibold">{item.name}</Text>
            <Text className="text-xs text-gray-500">Rp{item.price.toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

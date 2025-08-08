import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
}

function ProductCard({ id, title, price, image }: { id: string; title: string; price: number; image: string }) {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push(`../(untab)/shopDetails/${id}`)} className="w-[47%]" activeOpacity={0.8}>
      <View
        className="p-4 bg-white shadow-md rounded-2xl"
        style={{
          elevation: 5,
          height: 250,
          justifyContent: 'space-between',
        }}
      >
        {image ? <Image source={{ uri: image }} className="mb-2 bg-gray-200 aspect-square rounded-xl" /> : <View className="mb-2 bg-gray-200 aspect-square rounded-xl" />}
        <View>
          <Text className="text-lg font-bold text-black" numberOfLines={2}>
            {title}
          </Text>
          <Text className="mt-1 text-base font-semibold text-black">Rp{price.toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ShopScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error fetching products:', error.message);
    } else {
      setProducts(data as Product[]);
    }
    setLoading(false);
  };

  const categories = [
    { name: 'Kerajinan Tangan', icon: 'color-palette' },
    { name: 'Makanan & Minuman', icon: 'fast-food' },
    { name: 'Alat Rumah Tangga', icon: 'home' },
    { name: 'Pertanian & Perikanan', icon: 'leaf' },
  ];

  return (
    <ScrollView className="px-6 pt-8 bg-white">
      {/* Header dengan ikon keranjang */}
      <View className="flex-row items-center justify-between mt-5 mb-4">
        <Text className="text-2xl font-bold text-black">Toko</Text>
        <TouchableOpacity onPress={() => router.push('/(untab)/shopDetails/cart')} className="p-2 bg-pink-100 rounded-full">
          <Ionicons name="cart" size={24} color="#e91e63" />
        </TouchableOpacity>
      </View>

      {/* Pencarian */}
      <TextInput placeholder="Cari Produk Kesukaan Ibu ✨" placeholderTextColor="#888" className="px-5 py-4 mb-6 text-lg bg-pink-100 border border-pink-300 rounded-full" />

      {/* Header Kategori */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xl font-bold text-black">Kategori Produk</Text>
        <Text className="text-sm font-semibold text-pink-500">Lihat Selengkapnya</Text>
      </View>

      {/* Kategori */}
      <View className="flex-row flex-wrap justify-between mb-6 gap-y-4">
        {categories.map((cat, index) => (
          <TouchableOpacity key={index} className="w-[23%] bg-pink-100 rounded-2xl py-3 px-2 items-center justify-center border border-pink-200" style={{ height: 90 }} activeOpacity={0.8}>
            <View className="items-center justify-center w-10 h-10 mb-2 bg-pink-200 rounded-full">
              <Ionicons name={cat.icon as any} size={20} color="#BE185D" />
            </View>
            <Text className="text-xs font-medium text-center text-black">{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Rekomendasi */}
      <Text className="mb-5 text-2xl font-extrabold text-black">Rekomendasi Untuk Ibu</Text>

      {/* Produk */}
      {loading ? (
        <ActivityIndicator size="large" color="black" />
      ) : (
        <View className="flex-row flex-wrap justify-between pb-12 mb-20 gap-y-6">
          {products.map((item) => (
            <ProductCard key={item.id} id={item.id} title={item.title} price={item.price} image={item.image} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// app/shop.tsx
import { supabase } from '@/lib/supabase';
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
    <TouchableOpacity
      onPress={() => {
        console.log('Navigating to product ID:', id);
        router.push(`../(untab)/shopDetails/${id}`);
      }}
      className="w-[47%]"
      activeOpacity={0.8}
    >
      <View
        className="p-4 bg-white shadow-md rounded-2xl"
        style={{
          elevation: 5,
          height: 250, // 👈 tinggi kartu diseragamkan
          justifyContent: 'space-between',
        }}
      >
        {image ? <Image source={{ uri: image }} className="mb-2 bg-gray-200 aspect-square rounded-xl" /> : <View className="mb-2 bg-gray-200 aspect-square rounded-xl" />}
        <View>
          <Text className="text-lg font-bold text-pink-800" numberOfLines={2}>
            {title}
          </Text>
          <Text className="mt-1 text-base font-semibold text-gray-700">Rp{price.toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ShopScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <ScrollView className="px-6 pt-8 mt-5 bg-white">
      <TextInput placeholder="Cari Produk Kesukaan Ibu ✨" placeholderTextColor="#888" className="px-5 py-4 mb-6 text-lg bg-pink-100 border border-pink-300 rounded-full" />

      <Text className="mb-5 text-2xl font-extrabold text-pink-800">🌸 Rekomendasi Untuk Ibu 🌸</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#e91e63" />
      ) : (
        <View className="flex-row flex-wrap justify-between pb-12 gap-y-6">
          {products.map((item) => (
            <ProductCard key={item.id} id={item.id} title={item.title} price={item.price} image={item.image} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

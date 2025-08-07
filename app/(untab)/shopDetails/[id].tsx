import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons'; // Ganti dari lucide-react-native ke Ionicons
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface Product {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  price: number;
  image: string | null;
  created_at: string | null;
}

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();

    if (error) {
      console.error('Error fetching product:', error.message);
    } else {
      setProduct(data as Product);
    }
    setLoading(false);
  };

  const handleBuy = () => {
    if (product) {
      Alert.alert('Berhasil', `Kamu telah membeli ${product.title}`);
    }
  };

  if (loading || !product) {
    return (
      <View className="items-center justify-center flex-1">
        <ActivityIndicator size="large" color="#e91e63" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 px-6 pt-6 bg-white">
      {/* Tombol Back */}
      <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mt-10 mb-6">
        <Ionicons name="arrow-back" size={24} color="#e91e63" />
        <Text className="ml-2 text-base font-medium text-pink-600">Kembali</Text>
      </TouchableOpacity>

      {/* Gambar Produk */}
      {product.image ? <Image source={{ uri: product.image }} className="w-full mb-6 bg-gray-200 aspect-square rounded-2xl" /> : <View className="w-full mb-6 bg-gray-200 aspect-square rounded-2xl" />}

      {/* Judul Produk */}
      <Text className="mb-2 text-2xl font-extrabold text-pink-800">{product.title}</Text>

      {/* Harga */}
      <Text className="mb-4 text-xl font-semibold text-gray-700">Harga: Rp{product.price.toLocaleString()}</Text>

      {/* Tanggal Upload */}
      {product.created_at && (
        <Text className="mb-4 text-sm text-gray-500">
          Diposting pada:{' '}
          {new Date(product.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      )}

      {/* Deskripsi */}
      {product.description ? <Text className="mb-8 text-base leading-relaxed text-gray-800">{product.description}</Text> : <Text className="mb-8 text-base italic text-gray-500">Tidak ada deskripsi untuk produk ini.</Text>}

      {/* Tombol Beli */}
      <TouchableOpacity onPress={handleBuy} className="items-center justify-center py-4 mb-10 bg-pink-600 rounded-full shadow-md" activeOpacity={0.9}>
        <Text className="text-lg font-bold text-white">🛍️ Beli Sekarang</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

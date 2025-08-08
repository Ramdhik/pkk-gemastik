import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
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
  const [quantity, setQuantity] = useState(1);

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

  const handleBuy = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert('Error', 'Gagal mendapatkan informasi pengguna.');
      return;
    }

    const userId = user.id;

    if (!product) return;

    // Cek apakah produk sudah ada di keranjang
    const { data: existingCartItem, error: fetchError } = await supabase.from('cart_items').select('*').eq('user_id', userId).eq('product_id', product.id).single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // Error selain tidak ditemukan
      Alert.alert('Error', fetchError.message);
      return;
    }

    if (existingCartItem) {
      // Produk sudah ada → tambahkan jumlahnya
      const newQuantity = existingCartItem.quantity + quantity;

      const { error: updateError } = await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', existingCartItem.id);

      if (updateError) {
        Alert.alert('Error', updateError.message);
      } else {
        Alert.alert('Berhasil', `${product.title} ditambahkan ke keranjang (${quantity} ditambahkan, total ${newQuantity}).`);
      }
    } else {
      // Produk belum ada → masukkan baru
      const { error: insertError } = await supabase.from('cart_items').insert([
        {
          user_id: userId,
          product_id: product.id,
          quantity: quantity,
        },
      ]);

      if (insertError) {
        Alert.alert('Error', insertError.message);
      } else {
        Alert.alert('Berhasil', `${product.title} berhasil ditambahkan ke keranjang (jumlah: ${quantity}).`);
      }
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

      {/* Quantity */}
      <View className="flex-row items-center justify-between px-4 py-3 mb-6 bg-gray-100 rounded-xl">
        <Text className="text-base font-medium text-gray-800">Jumlah:</Text>
        <View className="flex-row items-center gap-x-3">
          <TouchableOpacity onPress={() => setQuantity((prev) => Math.max(1, prev - 1))} className="px-3 py-1 bg-pink-600 rounded-full">
            <Text className="text-lg font-bold text-white">−</Text>
          </TouchableOpacity>

          <Text className="text-base font-bold text-gray-900">{quantity}</Text>

          <TouchableOpacity onPress={() => setQuantity((prev) => prev + 1)} className="px-3 py-1 bg-pink-600 rounded-full">
            <Text className="text-lg font-bold text-white">＋</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tombol Beli */}
      <TouchableOpacity onPress={handleBuy} className="items-center justify-center py-4 mb-10 bg-pink-600 rounded-full shadow-md" activeOpacity={0.9}>
        <Text className="text-lg font-bold text-white">🛍️ Beli Sekarang</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

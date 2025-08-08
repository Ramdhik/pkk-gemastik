import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    image: string;
  };
}

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert('Error', 'Gagal mendapatkan informasi pengguna.');
      return;
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select(
        `
      id,
      quantity,
      product:product_id (
        id,
        title,
        price,
        image
      )
    `
      )
      .eq('user_id', user.id);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      // Paksa TypeScript untuk mengenali struktur data dengan benar
      setCartItems(data as unknown as CartItem[]);
    }

    setLoading(false);
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  };

  if (loading) {
    return (
      <View className="items-center justify-center flex-1">
        <ActivityIndicator size="large" color="#e91e63" />
      </View>
    );
  }

  return (
    <View className="flex-1 px-6 pt-10 bg-white">
      {/* Header */}
      <View className="flex-row items-center mt-5 mb-6">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={30} color="#e91e63" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-pink-700">Keranjang</Text>
      </View>

      <ScrollView className="mb-24">
        {cartItems.length === 0 ? (
          <Text className="mt-20 text-base text-center text-gray-600">Keranjang masih kosong 😔</Text>
        ) : (
          cartItems.map((item) => (
            <View key={item.id} className="flex-row items-center p-4 mb-4 bg-pink-50 rounded-xl">
              {item.product.image ? <Image source={{ uri: item.product.image }} className="w-20 h-20 mr-4 bg-gray-200 rounded-xl" /> : <View className="w-20 h-20 mr-4 bg-gray-200 rounded-xl" />}
              <View className="flex-1">
                <Text className="mb-1 text-base font-bold text-gray-800">{item.product.title}</Text>
                <Text className="text-sm text-gray-600">Jumlah: {item.quantity}</Text>
                <Text className="text-sm font-semibold text-gray-800">Rp{(item.quantity * item.product.price).toLocaleString()}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Checkout */}
      {cartItems.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-800">Total:</Text>
            <Text className="text-lg font-bold text-pink-700">Rp{getTotal().toLocaleString()}</Text>
          </View>
          <TouchableOpacity className="items-center justify-center py-4 bg-pink-600 rounded-full" activeOpacity={0.9} onPress={() => Alert.alert('Checkout', 'Fitur checkout belum tersedia.')}>
            <Text className="text-lg font-bold text-white">Checkout Sekarang</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

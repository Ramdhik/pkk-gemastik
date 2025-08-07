import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface Event {
  id: string;
  title: string;
  event_date: string;
  place: string | null;
  description?: string;
}

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError('ID event tidak ditemukan');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase.from('events').select('*').eq('id', id).single();

        if (fetchError) {
          setError('Gagal memuat data event');
        } else if (!data) {
          setError('Event tidak ditemukan');
        } else {
          setEvent(data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Terjadi kesalahan yang tidak terduga');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-gray-50">
        <ActivityIndicator size="large" color="#ec4899" />
        <Text className="mt-4 text-gray-600">Memuat detail event...</Text>
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 px-4 bg-gray-50">
        <Text className="mb-2 text-xl font-semibold text-gray-800">{error || 'Event tidak ditemukan'}</Text>
        <TouchableOpacity onPress={() => router.back()} className="px-6 py-3 bg-pink-500 rounded-full">
          <Text className="font-semibold text-white">Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 mt-10 bg-white shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-4">
          <Ionicons name="arrow-back" size={24} color="#ec4899" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Detail Event</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="p-6 bg-white shadow rounded-xl">
          <Text className="mb-4 text-2xl font-bold text-gray-800">{event.title}</Text>

          <View className="mb-4">
            <Text className="mb-1 text-sm font-semibold text-gray-600">Tanggal</Text>
            <Text className="text-lg text-gray-800">
              {new Date(event.event_date).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>

          {event.place && (
            <View className="mb-4">
              <Text className="mb-1 text-sm font-semibold text-gray-600">Tempat</Text>
              <Text className="text-lg text-gray-800">{event.place}</Text>
            </View>
          )}

          {event.description && (
            <View className="mb-4">
              <Text className="mb-1 text-sm font-semibold text-gray-600">Deskripsi</Text>
              <Text className="leading-6 text-gray-800">{event.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

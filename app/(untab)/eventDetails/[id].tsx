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

interface AttendanceData {
  user_id: string;
  profiles: {
    full_name: string;
  };
}

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<string[]>([]);
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
        // Ambil detail event
        const { data: eventData, error: fetchError } = await supabase.from('events').select('*').eq('id', id).single();

        if (fetchError || !eventData) {
          setError('Gagal memuat data event');
          setLoading(false);
          return;
        }

        setEvent(eventData);

        // Ambil daftar peserta
        const { data: attendanceData, error: attendanceError } = (await supabase.from('event_attendance').select('user_id, profiles(full_name)').eq('event_id', id)) as { data: AttendanceData[] | null; error: any };

        if (attendanceError) {
          console.error('Gagal mengambil data peserta:', attendanceError);
        } else if (attendanceData) {
          const names = attendanceData.map((a) => a.profiles?.full_name).filter((name): name is string => Boolean(name)); // Type guard untuk memastikan string
          setAttendees(names);
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

          {attendees.length > 0 && (
            <View className="mt-6">
              <Text className="mb-1 text-sm font-semibold text-gray-600">Peserta yang Hadir</Text>
              {attendees.map((name, index) => (
                <Text key={index} className="text-gray-800">
                  • {name}
                </Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

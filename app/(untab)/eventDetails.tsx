import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface Attendee {
  user_id: string;
  full_name: string;
}

interface Event {
  id: string;
  title: string;
  event_date: string;
  place: string;
}

export default function ScheduleDetailsScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    const fetchDetails = async () => {
      setLoading(true);

      // Ambil data event + tempat
      const { data: eventData } = await supabase.from('events').select('id, title, event_date, place').eq('id', eventId).maybeSingle();

      setEvent(eventData);

      // Ambil daftar kehadiran
      const { data: attendeesData } = await supabase.from('event_attendance').select('user_id, profiles(full_name)').eq('event_id', eventId).eq('is_attending', true);

      const mapped = (attendeesData || []).map((a: any) => ({
        user_id: a.user_id,
        full_name: a.profiles?.full_name || 'Tanpa Nama',
      }));

      setAttendees(mapped);
      setLoading(false);
    };

    fetchDetails();
  }, [eventId]);

  if (loading || !event) {
    return (
      <View className="items-center justify-center flex-1">
        <ActivityIndicator size="large" color="#f472b6" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="p-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="mb-4 text-pink-500">{'< Kembali'}</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-gray-800">{event.title}</Text>
        <Text className="text-gray-500">
          {new Date(event.event_date).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <Text className="mb-4 text-gray-600">📍 {event.place}</Text>

        <Text className="mb-2 text-lg font-semibold">Yang akan hadir:</Text>
        {attendees.length === 0 ? (
          <Text className="italic text-gray-400">Belum ada yang konfirmasi hadir.</Text>
        ) : (
          attendees.map((attendee, index) => (
            <View key={attendee.user_id} className="py-2 border-b border-gray-200">
              <Text>
                {index + 1}. {attendee.full_name}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

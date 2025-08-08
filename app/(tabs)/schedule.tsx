import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface Event {
  id: string;
  title: string;
  event_date: string;
  place: string | null;
}

interface AttendanceMap {
  [eventId: string]: {
    isAnswered: boolean;
    isAttending?: boolean;
  };
}

function EventCard({
  id,
  date,
  title,
  place,
  isAnswered,
  isAttending,
  onPress,
}: {
  id: string;
  date: string;
  title: string;
  place: string | null;
  isAnswered: boolean;
  isAttending?: boolean;
  onPress: (eventId: string, attend: boolean) => void;
}) {
  const router = useRouter();
  return (
    <View className="p-4 bg-white shadow mb-30 rounded-xl">
      <Text className="text-sm text-gray-400">{date}</Text>
      <Text className="mb-1 text-lg font-semibold">{title}</Text>
      {place && <Text className="mb-3 text-sm text-gray-600">{place}</Text>}

      <View className="flex-row space-x-2">
        <TouchableOpacity
          disabled={isAnswered}
          onPress={() => onPress(id, true)}
          className={`flex-1 py-2 rounded-full items-center 
            ${isAnswered ? 'bg-pink-500' : 'bg-gray-200'}`}
        >
          <Text
            className={`font-semibold 
              ${isAnswered ? 'text-white' : 'text-gray-400'}`}
          >
            {isAnswered ? 'Sudah Hadir' : 'Hadir'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => {
          console.log('Navigating to event ID:', id);
          // Ubah path ini sesuai struktur folder Anda
          router.push(`../(untab)/eventDetails/${id}`);
        }}
      >
        <Text className="mt-2 text-xs text-gray-400 underline">Lihat Selengkapnya</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ScheduleScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [attendance, setAttendance] = useState<AttendanceMap>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const session = (await supabase.auth.getSession()).data.session;
      const user = session?.user;

      if (!user) return;

      setUserId(user.id);

      const { data: eventsData } = await supabase.from('events').select('id, title, event_date, place').order('event_date', { ascending: true });

      setEvents(eventsData || []);

      const { data: attendanceData } = await supabase.from('event_attendance').select('event_id, is_attending').eq('user_id', user.id);

      const attendanceMap: AttendanceMap = {};
      (attendanceData || []).forEach((a) => {
        attendanceMap[a.event_id] = {
          isAnswered: true,
          isAttending: a.is_attending,
        };
      });

      setAttendance(attendanceMap);
    };

    fetchData();

    const channel = supabase
      .channel('realtime-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
        },
        (payload) => {
          const newEvent = payload.new as Event;
          setEvents((prev) => [...prev, newEvent]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAttendance = async (eventId: string, isAttending: boolean) => {
    if (!userId) return;
    console.log('Tombol Hadir diklik:', { eventId, isAttending });
    Alert.alert('Konfirmasi Kehadiran', 'Apakah kamu yakin ingin hadir dalam acara ini?', [
      {
        text: 'Batal',
        style: 'cancel',
      },
      {
        text: 'Ya, Saya Hadir',
        onPress: async () => {
          const existing = await supabase.from('event_attendance').select('*').eq('event_id', eventId).eq('user_id', userId).maybeSingle();

          if (existing.data) {
            await supabase.from('event_attendance').update({ is_attending: isAttending }).eq('id', existing.data.id);
          } else {
            await supabase.from('event_attendance').insert({
              event_id: eventId,
              user_id: userId,
              is_attending: isAttending,
            });
          }

          setAttendance((prev) => ({
            ...prev,
            [eventId]: {
              isAnswered: true,
              isAttending,
            },
          }));
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 mt-10 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="text-3xl font-bold text-gray-800">Jadwal Kegiatan PKK</Text>
        <TouchableOpacity className="px-4 py-2 bg-pink-500 rounded-full" onPress={() => router.push('/(untab)/addEvent')}>
          <Text className="font-semibold text-white">+ Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* ScrollView */}
      <ScrollView className="p-4 pt-0">
        {events.map((event) => (
          <EventCard
            key={event.id}
            id={event.id}
            date={new Date(event.event_date).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
            title={event.title}
            place={event.place}
            isAnswered={attendance[event.id]?.isAnswered ?? false}
            isAttending={attendance[event.id]?.isAttending}
            onPress={handleAttendance}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

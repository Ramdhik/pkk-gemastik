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
  };
}

function EventCard({ id, date, title, place, isAnswered, onPress }: { id: string; date: string; title: string; place: string | null; isAnswered: boolean; onPress: (eventId: string) => void }) {
  const router = useRouter();

  return (
    <View className="p-5 mb-6 bg-white shadow rounded-2xl">
      <Text className="mb-1 text-base text-pink-500">{date}</Text>
      <Text className="mb-1 text-xl font-bold text-gray-800">{title}</Text>
      {place && <Text className="mb-3 text-base text-gray-600">{place}</Text>}

      <View className="flex-row space-x-2">
        <TouchableOpacity disabled={isAnswered} onPress={() => onPress(id)} className={`flex-1 py-3 rounded-full items-center ${isAnswered ? 'bg-pink-500' : 'bg-pink-100'}`}>
          <Text className={`text-base font-semibold ${isAnswered ? 'text-white' : 'text-pink-600'}`}>{isAnswered ? 'Ikut Hadir' : 'Hadir'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push(`../(untab)/eventDetails/${id}`)}>
        <Text className="mt-3 text-sm text-pink-400 underline">Lihat Selengkapnya</Text>
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

      if (!user) {
        console.log('User tidak ditemukan');
        return;
      }

      setUserId(user.id);

      // Ambil daftar events
      const { data: eventsData, error: eventsErr } = await supabase.from('events').select('id, title, event_date, place').order('event_date', { ascending: true });

      if (eventsErr) {
        console.error('Gagal ambil event:', eventsErr);
        return;
      }

      setEvents(eventsData || []);

      // Ambil kehadiran
      const { data: attendanceData, error: attendanceErr } = await supabase.from('event_attendance').select('event_id').eq('user_id', user.id);

      if (attendanceErr) {
        console.error('Gagal ambil attendance:', attendanceErr);
        return;
      }

      const attendanceMap: AttendanceMap = {};
      (attendanceData || []).forEach((a) => {
        attendanceMap[a.event_id] = { isAnswered: true };
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

  const handleAttendance = async (eventId: string) => {
    if (!userId) {
      console.log('User ID tidak tersedia');
      return;
    }

    Alert.alert('Konfirmasi Kehadiran', 'Apakah kamu yakin ingin hadir dalam acara ini?', [
      {
        text: 'Batal',
        style: 'cancel',
        onPress: () => console.log('User batal hadir'),
      },
      {
        text: 'Ya, Saya Hadir',
        onPress: async () => {
          try {
            // Cek apakah sudah pernah hadir
            const { data: existing, error: selectError } = await supabase.from('event_attendance').select('*').eq('event_id', eventId).eq('user_id', userId).maybeSingle();

            if (selectError) {
              console.error('Gagal select:', selectError);
              return;
            }

            if (existing) {
              console.log('Sudah pernah hadir sebelumnya');
              return;
            }

            // Insert kehadiran
            const { error: insertError } = await supabase.from('event_attendance').insert({
              event_id: eventId,
              user_id: userId,
            });

            if (insertError) {
              console.error('Gagal insert kehadiran:', insertError);
              return;
            }

            // Update state
            setAttendance((prev) => ({
              ...prev,
              [eventId]: {
                isAnswered: true,
              },
            }));

            console.log('Berhasil insert kehadiran');
          } catch (err) {
            console.error('Error di handleAttendance:', err);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2 mt-14">
        <Text className="text-2xl font-bold text-gray-800">Jadwal Kegiatan PKK</Text>
        <TouchableOpacity className="px-4 py-2 bg-pink-500 rounded-full" onPress={() => router.push('/(untab)/addEvent')}>
          <Text className="font-semibold text-white">+ Tambah</Text>
        </TouchableOpacity>
      </View>

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
            onPress={handleAttendance}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

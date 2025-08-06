import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const eventData = [
  {
    date: '6 Agustus 2025',
    title: 'Penyuluhan ke desa A',
    isAnswered: true,
    isAttending: true,
  },
  {
    date: '7 Agustus 2025',
    title: 'Pelatihan UMKM',
    isAnswered: true,
    isAttending: false,
  },
  {
    date: '8 Agustus 2025',
    title: 'Rapat Koordinasi',
    isAnswered: false,
  },
  {
    date: '9 Agustus 2025',
    title: 'Kunjungan Puskesmas',
    isAnswered: true,
    isAttending: true,
  },
  {
    date: '10 Agustus 2025',
    title: 'Penyuluhan Gizi',
    isAnswered: false,
  },
  {
    date: '11 Agustus 2025',
    title: 'Pemeriksaan Kesehatan Gratis',
    isAnswered: true,
    isAttending: false,
  },
  {
    date: '12 Agustus 2025',
    title: 'Donor Darah Desa B',
    isAnswered: false,
  },
  {
    date: '13 Agustus 2025',
    title: 'Bakti Sosial',
    isAnswered: true,
    isAttending: true,
  },
  {
    date: '14 Agustus 2025',
    title: 'Seminar Pertanian',
    isAnswered: false,
  },
];

// ✅ Function component EventCard langsung di file ini
function EventCard({
  date,
  title,
  isAnswered,
  isAttending,
}: {
  date: string;
  title: string;
  isAnswered: boolean;
  isAttending?: boolean;
}) {
  return (
    <View className="p-4 mb-4 bg-white shadow rounded-xl">
      <Text className="text-sm text-gray-400">{date}</Text>
      <Text className="mb-4 text-lg font-semibold">{title}</Text>

      <View className="flex-row space-x-2">
        <TouchableOpacity
          className={`flex-1 py-2 rounded-full items-center 
            ${isAnswered ? (isAttending ? 'bg-pink-500' : 'bg-pink-200') : 'bg-gray-200'}`}
        >
          <Text
            className={`font-semibold 
              ${isAnswered ? (isAttending ? 'text-white' : 'text-pink-600') : 'text-gray-400'}`}
          >
            Hadir
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-2 rounded-full items-center 
            ${isAnswered ? (!isAttending ? 'bg-pink-200' : 'bg-pink-500') : 'bg-gray-200'}`}
        >
          <Text
            className={`font-semibold 
              ${isAnswered ? (!isAttending ? 'text-pink-600' : 'text-white') : 'text-gray-400'}`}
          >
            Tidak
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="mt-2 text-xs text-gray-400">Lihat Selengkapnya</Text>
    </View>
  );
}

export default function ScheduleScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="p-4">
        {eventData.map((event, index) => (
          <EventCard
            key={index}
            date={event.date}
            title={event.title}
            isAnswered={event.isAnswered}
            isAttending={event.isAttending}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

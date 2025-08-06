import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="items-center justify-center flex-1 p-5">
        <Text className="text-3xl font-bold">This screen does not exist.</Text>
        <Link href="/" className="py-4 mt-4">
          <Text className="text-lg text-blue-500 underline">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

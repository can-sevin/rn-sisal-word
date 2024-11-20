import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function VoicePage() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Voice Page</Text>
      <Text>Voice recognition functionality will go here.</Text>
      <Button title="Go Back" onPress={() => router.push('/')} />
    </View>
  );
}
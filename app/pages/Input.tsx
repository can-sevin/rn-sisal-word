import { View, Text, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function InputPage() {
  const [text, setText] = useState('');
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Input Page</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          width: '80%',
          padding: 10,
          marginBottom: 20,
        }}
        placeholder="Type something..."
        value={text}
        onChangeText={setText}
      />
      <Button title="Go Back" onPress={() => router.push('/')} />
    </View>
  );
}
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Button,
} from "react-native";
import Voice from "@wdragon/react-native-voice";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import translate from "translate-google-api";

export default function VoiceScreen({ route }) {
  const router = useRouter();

  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);

  const mainLanguage = route?.params?.main || "en";
  const targetLanguage = route?.params?.target || "fr";

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = () => {
    setIsListening(true);
  };

  const onSpeechEnd = () => {
    setIsListening(false);
  };

  const onSpeechResults = (event: { value: any[]; }) => {
    const sentence = event.value[0];
    setRecognizedText(sentence);
    setWords(sentence.split(" ").map((word: string) => word.trim()));
  };

  const onSpeechError = (event: { error: any; }) => {
    console.error("Speech recognition error:", event.error);
    Alert.alert("Error", "Speech recognition failed. Please try again.");
    setIsListening(false);
  };

  const startListening = async () => {
    try {
      setRecognizedText("");
      setWords([]);
      setIsListening(true);
      await Voice.start(mainLanguage);
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      Alert.alert("Error", "Could not start speech recognition.");
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    }
  };

  const translateAndSaveWord = async (word: any) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("User not logged in", "Please log in to save your words.");
      return;
    }

    const userId = currentUser.uid;
    const database = getDatabase();
    const tablePath = `${userId}/words/${mainLanguage}-${targetLanguage}`;

    try {
      setLoading(true);

      const translated = await translate([word], {
        from: mainLanguage,
        to: targetLanguage,
      });

      const key = `${word}-${translated[0]}`.replace(/[^a-zA-Z0-9-_]/g, "");
      const wordEntry = {
        original: word,
        translated: translated[0],
      };

      const wordRef = ref(database, `${tablePath}/${key}`);
      await set(wordRef, wordEntry);

      Alert.alert("Success", `Word "${word}" translated to "${translated[0]}" and saved!`);
    } catch (error) {
      console.error("Error translating or saving word:", error);
      Alert.alert("Error", "Could not translate or save the word.");
    } finally {
      setLoading(false);
    }
  };

  const renderWordItem = ({ item }) => (
    <TouchableOpacity
      style={styles.wordItem}
      onPress={() => translateAndSaveWord(item)}
      disabled={loading}
    >
      <Text style={styles.wordText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Speak something in {mainLanguage.toUpperCase()}:
        </Text>
        <TouchableOpacity
          style={styles.listenButton}
          onPress={isListening ? stopListening : startListening}
        >
          <Text style={styles.listenButtonText}>
            {isListening ? "Stop Listening" : "Start Listening"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.recognizedText}>{recognizedText}</Text>

      <FlatList
        data={words}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={renderWordItem}
        contentContainerStyle={styles.wordList}
      />

      <View style={styles.footer}>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  listenButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  listenButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  recognizedText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
  wordList: {
    marginTop: 20,
  },
  wordItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
  },
  wordText: {
    fontSize: 18,
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
});
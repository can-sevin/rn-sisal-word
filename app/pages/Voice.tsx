import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Button,
  ActivityIndicator,
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

  const mainLanguage = route?.params?.main;
  const targetLanguage = route?.params?.target;

  useEffect(() => {
    if (!mainLanguage || !targetLanguage) {
      Alert.alert(
        "Missing Language Parameters",
        "Required language parameters are not provided. Please go back and try again."
      );
      router.back();
      return;
    }

    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = () => setIsListening(true);

  const onSpeechEnd = () => setIsListening(false);

  const onSpeechResults = (event) => {
    const sentence = event.value[0];
    setRecognizedText(sentence);
    setWords(sentence.split(" ").map((word) => word.trim()));
  };

  const onSpeechError = (event) => {
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
      Alert.alert("Error", "An issue occurred while starting speech recognition.");
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

  const translateAndSaveWord = async (word) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Error", "You need to log in to save the word.");
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

      Alert.alert("Success", `The word "${word}" has been saved as "${translated[0]}".`);
    } catch (error) {
      console.error("Error translating or saving word:", error);
      Alert.alert("Error", "Failed to save the word.");
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

  if (!mainLanguage || !targetLanguage) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Missing language parameters. Please go back and try again.
        </Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

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

      {loading && <ActivityIndicator size="large" color="#007bff" />}

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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
});
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
} from "react-native";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import translate from "translate-google-api";

const InputScreen = () => {
  const { main, target } = useLocalSearchParams();
  const mainLanguage = main as string;
  const targetLanguage = target as string;

  const [text, setText] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!mainLanguage || !targetLanguage) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Missing language parameters.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleAddWords = async () => {
    Keyboard.dismiss();

    const words = text
      .split(",")
      .map((word) => word.trim())
      .filter((word) => word !== "");

    if (words.length === 0) {
      Alert.alert("Invalid Input", "Please enter valid words separated by commas.");
      return;
    }

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
      setStatusMessage("Translating and saving words...");

      for (const word of words) {
        try {
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
        } catch {
          throw new Error(`Translation failed for word: ${word}`);
        }
      }

      setStatusMessage("Words successfully added to the database!");
      setText("");
    } catch {
      setStatusMessage("Failed to save words. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Enter words (e.g., apple, pear, grape)"
        value={text}
        onChangeText={setText}
        multiline={true}
      />

      <Text style={styles.statusMessage}>{statusMessage}</Text>

      <TouchableOpacity style={styles.addButton} onPress={handleAddWords} disabled={loading}>
        <Text style={styles.addButtonText}>{loading ? "Saving..." : "Add Words"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default InputScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: "#333",
  },
  input: {
    marginTop: 100,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    height: 100,
    textAlignVertical: "top",
    fontSize: 16,
  },
  statusMessage: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#555",
  },
  addButton: {
    marginTop: 20,
    marginHorizontal: 50,
    paddingVertical: 15,
    backgroundColor: "#28a745",
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  errorText: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 18,
    color: "red",
  },
});
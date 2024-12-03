import { Flags } from "@/config/flag";
import { router } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";

export default function HomeScreen() {
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("fr");
  const [wordList, setWordList] = useState([]);

  useEffect(() => {
    fetchWordList();
  }, [sourceLanguage, targetLanguage]);

  const fetchWordList = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("User not logged in", "Please log in to view your words.");
      return;
    }

    const userId = currentUser.uid;
    const database = getDatabase();
    const tablePath = `${userId}/words/${sourceLanguage}-${targetLanguage}`;
    const wordsRef = ref(database, tablePath);

    onValue(wordsRef, (snapshot) => {
      if (snapshot.exists()) {
        const words = snapshot.val();
        const formattedWordList = Object.keys(words).map((key) => ({
          id: key,
          source: words[key].original,
          target: words[key].translated,
        }));
        setWordList(formattedWordList);
      } else {
        setWordList([]);
      }
    });
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      Alert.alert("Logout", "You have been logged out successfully.");
      router.push("/");
    } catch (error) {
      Alert.alert("Logout Error", error.message);
    }
  };

  const renderWordItem = ({ item }) => (
    <View style={styles.wordItem}>
      <Text style={styles.wordText}>{item.source}</Text>
      <Text style={styles.wordText}>{item.target}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Language Selection */}
      <View style={styles.languageSelection}>
        <Text style={styles.languageLabel}>Source Language:</Text>
        <View style={styles.languageOptions}>
          {Object.keys(Flags).map((langCode) => (
            <TouchableOpacity
              key={langCode}
              onPress={() => setSourceLanguage(langCode)}
              style={[
                styles.languageOption,
                sourceLanguage === langCode && styles.selectedLanguage,
              ]}
            >
              <Text style={styles.languageEmoji}>{Flags[langCode].flag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.languageLabel}>Target Language:</Text>
        <View style={styles.languageOptions}>
          {Object.keys(Flags).map((langCode) => (
            <TouchableOpacity
              key={langCode}
              onPress={() => setTargetLanguage(langCode)}
              style={[
                styles.languageOption,
                targetLanguage === langCode && styles.selectedLanguage,
              ]}
            >
              <Text style={styles.languageEmoji}>{Flags[langCode].flag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Word List */}
      <FlatList
        data={wordList}
        keyExtractor={(item) => item.id}
        renderItem={renderWordItem}
        contentContainerStyle={styles.wordList}
      />

      {/* Add Word Section */}
      <View style={styles.addWordSection}>
        <Text style={styles.addWordText}>Add Word:</Text>
        <View style={styles.addWordOptions}>
          <TouchableOpacity
            style={styles.addWordButton}
            onPress={() =>
              router.push({
                pathname: "./Input",
                params: { main: sourceLanguage, target: targetLanguage },
              })
            }
          >
            <Text style={styles.addWordButtonText}>Input</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addWordButton} onPress={() =>               
          router.push({
                pathname: "./Voice",
                params: { main: sourceLanguage, target: targetLanguage },
              })}>
            <Text style={styles.addWordButtonText}>Voice</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addWordButton} onPress={() =>               
          router.push({
                pathname: "./Camera",
                params: { main: sourceLanguage, target: targetLanguage },
              })}>
            <Text style={styles.addWordButtonText}>Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  logoutButton: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 10,
  },
  logoutText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
  languageSelection: {
    marginTop: 80,
    marginBottom: 20,
  },
  languageLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  languageOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  languageOption: {
    padding: 10,
    borderRadius: 8,
  },
  selectedLanguage: {
    backgroundColor: "lightcoral",
  },
  languageEmoji: {
    fontSize: 24,
  },
  wordList: {
    flexGrow: 1,
    marginVertical: 20,
  },
  wordItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  wordText: {
    fontSize: 18,
  },
  addWordSection: {
    marginTop: 20,
    alignItems: "center",
  },
  addWordText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  addWordOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  addWordButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    width: "30%",
    alignItems: "center",
  },
  addWordButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
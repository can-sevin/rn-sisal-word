import { getAuth, signOut } from "firebase/auth";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from "react-native";

export default function HomeScreen() {
  const [sourceLanguage, setSourceLanguage] = useState("🇬🇧 English");
  const [targetLanguage, setTargetLanguage] = useState("🇫🇷 French");
  const wordList = [
    { id: "1", source: "Hello", target: "Bonjour" },
    { id: "2", source: "Goodbye", target: "Au revoir" },
  ];

  const handleLogout = async () => {
    const auth = getAuth(); // Initialize Firebase auth
    try {
      await signOut(auth); // Sign out the user
      Alert.alert("Logout", "You have been logged out successfully.");
      // Optionally, redirect the user to a login screen or clear any user state
    } catch (error) {
      Alert.alert("Logout Error", error.message); // Show error message if logout fails
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
    {["🇬🇧", "🇫🇷", "🇮🇹", "🇩🇪", "🇹🇷"].map((lang) => (
      <TouchableOpacity
        key={lang}
        onPress={() => setSourceLanguage(lang)}
        style={[
          styles.languageOption,
          sourceLanguage === lang && styles.selectedLanguage,
        ]}
      >
        <Text style={styles.languageEmoji}>{lang}</Text>
      </TouchableOpacity>
    ))}
   </View>
   <Text style={styles.languageLabel}>Target Language:</Text>
   <View style={styles.languageOptions}>
    {["🇬🇧", "🇫🇷", "🇮🇹", "🇩🇪", "🇹🇷"].map((lang) => (
      <TouchableOpacity
        key={lang}
        onPress={() => setTargetLanguage(lang)}
        style={[
          styles.languageOption,
          targetLanguage === lang && styles.selectedLanguage,
        ]}
      >
        <Text style={styles.languageEmoji}>{lang}</Text>
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
          <TouchableOpacity style={styles.addWordButton}>
            <Text style={styles.addWordButtonText}>Input</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addWordButton}>
            <Text style={styles.addWordButtonText}>Voice</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addWordButton}>
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
import { Flags } from "@/config/flag";
import { router } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";
import { fetchTranslations } from "@/config/gpt";

export default function HomeScreen() {
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("tr");
  const [wordList, setWordList] = useState([]);
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    onValue(
      wordsRef,
      (snapshot) => {
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
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching words:", error);
        setLoading(false);
      }
    );
  };

  const handlePractice = async () => {
    if (wordList.length === 0) {
      Alert.alert("No Words", "Please add words before practicing.");
      return;
    }

    try {
      setLoading(true);

      const originalWords = wordList.map((word) => word.source);
      const translatedWords = wordList.map((word) => word.target);

      const preparedQuestions = [];
      await fetchTranslations(
        originalWords,
        translatedWords,
        targetLanguage,
        (cards) => {
          if (cards.length > 0) {
            cards.forEach(({ text: originalWord, correct: translatedWord, ...options }) => {
              const allOptions = [options.top, options.bottom, options.left, options.right].sort(
                () => Math.random() - 0.5
              );
              preparedQuestions.push({
                originalWord,
                translatedWord,
                options: allOptions,
              });
            });
          } else {
            console.error("Failed to prepare questions.");
          }
        },
        setLoading
      );

      router.push({
        pathname: "./Question",
        params: {
          main: sourceLanguage,
          target: targetLanguage,
          words: JSON.stringify(preparedQuestions),
        },
      });
    } catch (error) {
      console.error("Error preparing questions:", error);
      Alert.alert("Error", "Failed to prepare questions.");
    } finally {
      setLoading(false);
    }
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
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.languageSelection}>
        <Text style={styles.languageLabel}>Source Language:</Text>
        <View style={styles.languageOptions}>
          {Object.keys(Flags).map((langCode) => (
            <TouchableOpacity
              key={langCode}
              onPress={() => {
                if (langCode !== targetLanguage) {
                  setSourceLanguage(langCode);
                } else {
                  Alert.alert("Error", "Source and target languages cannot be the same.");
                }
              }}
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
              onPress={() => {
                if (langCode !== sourceLanguage) {
                  setTargetLanguage(langCode);
                } else {
                  Alert.alert("Error", "Target and source languages cannot be the same.");
                }
              }}
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

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={wordList}
          keyExtractor={(item) => item.id}
          renderItem={renderWordItem}
          contentContainerStyle={styles.wordList}
        />
      )}

      <TouchableOpacity style={styles.practiceButton} onPress={handlePractice} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.practiceButtonText}>Practice</Text>
        )}
      </TouchableOpacity>

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
          <TouchableOpacity
            style={styles.addWordButton}
            onPress={() =>
              router.push({
                pathname: "./Voice",
                params: { main: sourceLanguage, target: targetLanguage },
              })
            }
          >
            <Text style={styles.addWordButtonText}>Voice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addWordButton}
            onPress={() =>
              router.push({
                pathname: "./Camera",
                params: { main: sourceLanguage, target: targetLanguage },
              })
            }
          >
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
    paddingBottom: 20,
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
  practiceButton: {
    marginTop: 20,
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  practiceButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
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
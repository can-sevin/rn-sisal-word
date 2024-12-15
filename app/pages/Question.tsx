import { fetchTranslations } from "@/config/gpt";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Bar } from "react-native-progress";

const QuestionScreen = () => {
  const { main, target, words } = useLocalSearchParams();
  const mainLanguage = main as string;
  const targetLanguage = target as string;
  const parsedWords = JSON.parse(words);

  if (!mainLanguage || !targetLanguage || !parsedWords.length) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Missing or invalid parameters. Please go back and try again.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/")}>
          <Text style={styles.backButtonText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    prepareQuestions();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleTimeUp();
    }
  }, [timeLeft]);

  const prepareQuestions = async () => {
    try {
      setLoading(true);
      const preparedQuestions = [];
  
      for (const word of parsedWords) {
        const { originalWord, translatedWord, options } = word;
  
        if (options && options.length > 0) {
          preparedQuestions.push({
            originalWord,
            translatedWord,
            options: options.sort(() => Math.random() - 0.5),
          });
        } else {
          await fetchTranslations(
            [originalWord],
            [translatedWord],
            targetLanguage,
            (cards) => {
              if (cards.length > 0) {
                const { top, bottom, left, right } = cards[0];
                const newOptions = [top, bottom, left, right].sort(() => Math.random() - 0.5);
                preparedQuestions.push({
                  originalWord,
                  translatedWord,
                  options: newOptions,
                });
              }
            },
            setLoading
          );
        }
      }
  
      setQuestions(preparedQuestions);
    } catch (error) {
      Alert.alert("Error", "Failed to prepare questions.");
      console.error("Error in prepareQuestions:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);

    if (answer === currentQuestion.translatedWord) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setWrongCount((prev) => prev + 1);
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setTimeLeft(30);

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        Alert.alert(
          "Quiz Complete",
          `Correct: ${correctCount + (answer === currentQuestion.translatedWord ? 1 : 0)}, Wrong: ${wrongCount + (answer !== currentQuestion.translatedWord ? 1 : 0)}`
        );
        router.back();
      }
    }, 2000);
  };

  const handleTimeUp = () => {
    setWrongCount((prev) => prev + 1);
    setTimeout(() => {
      setTimeLeft(30);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        Alert.alert("Quiz Complete", `Correct: ${correctCount}, Wrong: ${wrongCount}`);
        router.back();
      }
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Preparing questions...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.questionText}>
            What's the meaning of:{" "}
            <Text style={styles.highlight}>{currentQuestion?.originalWord}</Text>?
          </Text>
          <Bar
            progress={timeLeft / 30}
            width={null}
            color="#ff0000"
            borderWidth={1}
            unfilledColor="#ddd"
            style={styles.progressBar}
          />
          <Text style={styles.timer}>Time left: {timeLeft}s</Text>
          <View style={styles.optionsContainer}>
            {currentQuestion?.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === option
                    ? option === currentQuestion.translatedWord
                      ? styles.correctAnswer
                      : styles.wrongAnswer
                    : null,
                ]}
                onPress={() => handleAnswer(option)}
                disabled={!!selectedAnswer}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#555",
    marginTop: 10,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  highlight: {
    color: "#007bff",
  },
  progressBar: {
    marginVertical: 10,
  },
  timer: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
    color: "#ff0000",
  },
  optionsContainer: {
    marginTop: 20,
  },
  optionButton: {
    backgroundColor: "#e0e0e0",
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 18,
    textAlign: "center",
  },
  correctAnswer: {
    backgroundColor: "#4caf50",
  },
  wrongAnswer: {
    backgroundColor: "#f44336",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    textAlign: "center",
  },
});

export default QuestionScreen;
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import TextRecognition from "@react-native-ml-kit/text-recognition";
import translate from "translate-google-api";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";

export default function CameraPage({ route }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState(null);
  const [facing, setFacing] = useState("back");
  const [capturedWords, setCapturedWords] = useState([]);
  const [loading, setLoading] = useState(false);

  const mainFlag = route?.params?.main;
  const targetFlag = route?.params?.target;

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  if (!mainFlag || !targetFlag) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.errorText}>
          Missing language parameters. Please go back and try again.
        </Text>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const captureAndProcessImage = async () => {
    if (!cameraRef) return;

    try {
      setLoading(true);
      const photo = await cameraRef.takePictureAsync();
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 800 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      const result = await TextRecognition.recognize(manipulatedImage.uri);
      const words = result.text
        .split(/\s+/)
        .map((word) => word.trim())
        .filter(Boolean);

      setCapturedWords(words);
    } catch (error) {
      console.error("Error processing image:", error);
      Alert.alert("Error", "An error occurred while processing the image.");
    } finally {
      setLoading(false);
    }
  };

  const translateAndSaveWord = async (word) => {
    try {
      setLoading(true);

      const [translation] = await translate([word], { from: mainFlag, to: targetFlag });
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        Alert.alert("Error", "You must be logged in to save words.");
        return;
      }

      const database = getDatabase();
      const userId = currentUser.uid;
      const refPath = `${userId}/words/${mainFlag}-${targetFlag}`;
      const wordRef = ref(database, `${refPath}/${word}`);

      await set(wordRef, {
        original: word,
        translated: translation,
      });

      Alert.alert("Success", `"${word}" has been saved as "${translation}".`);
    } catch (error) {
      console.error("Error during translation or saving:", error);
      Alert.alert("Error", "Failed to save the word.");
    } finally {
      setLoading(false);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text>Camera permission is required.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        type={facing}
        ref={(ref) => setCameraRef(ref)}
      >
        <View style={styles.cameraButtons}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.buttonText}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={captureAndProcessImage}>
            <Text style={styles.buttonText}>Capture</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      <ScrollView style={styles.wordContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          capturedWords.map((word, index) => (
            <TouchableOpacity
              key={`${word}-${index}`}
              style={styles.wordButton}
              onPress={() => translateAndSaveWord(word)}
            >
              <Text style={styles.wordText}>{word}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  camera: {
    flex: 3,
  },
  cameraButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  button: {
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 5,
  },
  buttonText: {
    color: "black",
    fontSize: 16,
  },
  wordContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 10,
  },
  wordButton: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    marginVertical: 5,
    alignItems: "center",
  },
  wordText: {
    color: "white",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
});
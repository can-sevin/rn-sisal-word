cat << EOF > README.md
# **Welcome to RN Sisal Word 👋**

This is an [Expo](https://expo.dev) project created with [create-expo-app](https://www.npmjs.com/package/create-expo-app). RN Sisal Word is a React Native app for OCR-based text recognition, voice-to-text, and manual text translation with Firebase integration.

## **Get Started**

1. **Install dependencies**

   \`\`\`bash
   npm install
   \`\`\`

2. **Start the app**

   \`\`\`bash
   npx expo start
   \`\`\`

You’ll see options to open the app in:

- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for app development with Expo.

## **Features**

- **Camera-based OCR**  
  Capture images, extract text using OCR (\`@react-native-ml-kit/text-recognition\`), translate the text, and save it to Firebase.

- **Voice-to-Text Translation**  
  Use the voice-to-text functionality (\`@react-native-voice/voice\`) to translate spoken words and save them.

- **Manual Text Translation**  
  Manually input text, translate it, and store translations in Firebase for future reference.

- **Firebase Integration**  
  - User authentication (login and registration) via **Firebase Authentication**.
  - Save translations and manage user data in **Firebase Realtime Database**.

## **Folder Structure**

\`\`\`
RN-Sisal-Word/
├── app/
│   └── pages/
│       ├── Camera.tsx       # Camera-based OCR and translation
│       ├── Home.tsx         # Main navigation hub
│       ├── Input.tsx        # Manual text translation and saving
│       ├── Login.tsx        # User login functionality
│       ├── Register.tsx     # User registration functionality
│       └── Voice.tsx        # Voice-to-text translation
├── App.js                   # Main entry point of the app
└── app.json                 # Expo configuration file
\`\`\`

## **Usage**

To test and develop this project:

1. **Run the app**  
   Start the project with:

   \`\`\`bash
   npx expo start
   \`\`\`

2. **Navigate the app**  
   - Explore the **Home** page to access core features:
     - Camera-based OCR
     - Voice-to-text translation
     - Manual text translation
   - Log in or register to save your translations.

## **Resources**

- **Documentation**  
  - [Expo](https://docs.expo.dev/)  
  - [Firebase](https://firebase.google.com/docs/)  
  - [@react-native-ml-kit/text-recognition](https://github.com/balthazar/react-native-ml-kit)  
  - [@react-native-voice/voice](https://github.com/react-native-voice/voice)

- **Guides for Beginners**  
  - Follow the associated **Medium article series** to learn how this app was built step by step.

## **Contribute**

Feel free to fork this project, report issues, or submit pull requests to enhance its functionality.

---
EOF
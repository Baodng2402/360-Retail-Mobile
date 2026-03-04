# 360 Rental Mobile 🚀

This is the mobile application for the **360 Rental** platform, built using the modern **React Native** ecosystem (Expo SDK 54, React 19.1, NativeWind/TailwindCSS).

The application relies on critical Native Modules (like _Google Sign-In_). Therefore, **DO NOT** attempt to run this project via the Expo Go app. You must use the Development Build (`run:android` / `run:ios`).

---

## 🛠 Tech Stack

- **Framework**: [Expo SDK 54](https://expo.dev/) (Managed + Custom Native Code)
- **UI & Styling**: [NativeWind](https://www.nativewind.dev/) (TailwindCSS for React Native)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Language**: TypeScript
- **Auth**: Google Sign-In (`@react-native-google-signin/google-signin`)

---

## 🛑 Prerequisites

To successfully clone and run this project, **you MUST install the following**:

1. **Node.js** (v18 or newer)
2. **NPM** or **Yarn**
3. **Java Environment (STRICTLY JDK 17)**:
   > ⚠️ **Critical**: React Native and Expo's Android C++ compiler are currently **incompatible** with Java 21 or 24. You must install **JDK 17** and configure your `JAVA_HOME` environment variable.
   - For Mac (Homebrew): `brew install openjdk@17`
   - For Windows: Download and install OpenJDK 17.
4. **Mobile Emulators**:
   - Xcode (Mac only, for the iOS Simulator).
   - Android Studio (For the Android Emulator and Android SDK).

---

## ⚙️ Setup & Installation Guide

Follow these sequential steps if you've just cloned the repository:

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment Variables

Copy the example environment file into a new `.env` file at the root:

```bash
cp .env.example .env
```

Update the `EXPO_PUBLIC_API_URL` variable with your correct API endpoint.

### Step 3: Google Services Setup (Firebase)

Since this app relies on Google Sign-In, it requires Google configuration files.

1. Ask the project leader or download the latest **`google-services.json`** for Android (and `GoogleService-Info.plist` for iOS if applicable) from the [Firebase Console](https://console.firebase.google.com/) and place it in the **ROOT FOLDER** of the project.
2. ⚠️ **Crucial for Android**: Find the SHA-1 footprint of your machine's Debug Keystore:
   - **Mac/Linux:** `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep "SHA1:"`
   - **Windows:** `keytool -list -v -keystore "\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android`
     👉 Copy the output **SHA-1** string and add it to the Certificate Fingerprints of your Android App in Firebase Settings. If you miss this step, clicking the Google Sign-In button will result in a **red screen crash** (`DEVELOPER_ERROR`).

### Step 4: Build and Run Native App

Please **STOP** using the `npx expo start` command (or npm start) out of habit. Expo Go does not compile the Google Sign-In native library. You must build the Native App:

#### 👉 On Android (Ensure Android Studio emulator is running):

```bash
npx expo run:android
```

_(The first build takes 1-3 minutes to compile C++ code, subsequent builds will be much faster)._

#### 👉 On iOS (Mac only):

```bash
npx expo run:ios
```

---

## 🗂 Folder Structure

```text
├── App.tsx              # Main application entry point
├── components/          # Shared UI components (Buttons, Inputs...)
├── assets/              # Images, Fonts, Icons
├── app.json             # App versioning, naming, and Expo Plugins config
├── tailwind.config.js   # Tailwind Configuration (Colors palette, Spacing)
├── tsconfig.json        # TypeScript config and path aliases
├── eas.json             # EAS Cloud Deployment/Build config
└── src/                 # Main source folder (Screens, API, Navigation, Utils)
```

## ⌨️ IDE Configuration

The project uses the `@/` path alias pointing to the root directory. Instead of writing `../../../components/...`, you simply import as:

```typescript
import { PrimaryButton } from '@/src/components';
```

---

_360 Rental Mobile Project - All rights reserved!_

# 360 Rental Mobile

A mobile application built with **Expo** and **React Native** for the 360 Rental platform.

## Tech Stack

- **Framework**: Expo SDK 54
- **UI**: React Native with NativeWind (TailwindCSS)
- **Language**: TypeScript

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (macOS) or Android Emulator

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm start
```

### 3. Run on device/emulator

- **iOS**: Press `i` in the terminal or run `npm run ios`
- **Android**: Press `a` in the terminal or run `npm run android`
- **Web**: Press `w` in the terminal or run `npm run web`

## Available Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm start`       | Start Expo development server  |
| `npm run ios`     | Run on iOS simulator           |
| `npm run android` | Run on Android emulator        |
| `npm run web`     | Run on web browser             |
| `npm run lint`    | Run ESLint and Prettier check  |
| `npm run format`  | Fix ESLint and Prettier issues |

## Project Structure

```
├── App.tsx              # Main application entry
├── components/          # Reusable UI components
├── assets/              # Images, icons, and fonts
├── app.json             # Expo configuration
├── tailwind.config.js   # TailwindCSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Path Aliases

The project uses `@/` as a path alias for the root directory:

```typescript
import { ScreenContent } from '@/components/ScreenContent';
```

## License

Private - All rights reserved.

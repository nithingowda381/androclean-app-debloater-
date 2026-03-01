# AndroClean (WebUSB Android Debloater)

AndroClean is a React + TypeScript web app that connects to an Android device through **WebUSB + WebADB** and helps remove unwanted packages without root.

It runs entirely in the browser. Device commands are executed over an authenticated ADB session from your local machine.

## What it does

- Connects to Android devices via WebUSB.
- Scans installed packages (`pm list packages`).
- Labels known bloatware using a curated package list.
- Supports batch uninstall for user 0 (`pm uninstall -k --user 0 <package>`).
- Provides preset debloat profiles (Samsung / Xiaomi).
- Exports package snapshots (JSON) and command logs (TXT).
- Includes a local help chatbot for common troubleshooting guidance.

## Tech stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- `@yume-chan/adb` ecosystem:
  - `@yume-chan/adb`
  - `@yume-chan/adb-daemon-webusb`
  - `@yume-chan/adb-credential-web`
- `lucide-react` icons

## Requirements

### Runtime requirements

- Chromium-based desktop browser with WebUSB support (Chrome/Edge recommended)
- Android device with:
  - Developer options enabled
  - USB debugging enabled
- USB cable with data transfer support

### Development requirements

- Node.js 18+ (or newer LTS)
- npm

## Quick start

```bash
npm install
npm run dev
```

Open the local Vite URL and click **Connect Android Device**.

## Available scripts

- `npm run dev` — start dev server
- `npm run build` — type-check and build production bundle
- `npm run lint` — run ESLint
- `npm run preview` — preview production build locally

## User flow

1. **Welcome Screen**
   - Explains setup and safety notes.
   - Starts WebUSB device selection and ADB authentication.
2. **Dashboard**
   - Queries Android version and app counts.
   - Shows quick navigation actions.
3. **App Packages**
   - Loads package list from device.
   - Supports search/filter/select/batch uninstall with confirmation modal.
4. **Recommended Debloat**
   - Runs predefined package-removal profiles by OEM.
5. **Backup & Restore**
   - Exports current package inventory to JSON.
6. **Logs & Monitor**
   - Shows command/output event stream from the ADB layer.
7. **Settings**
   - Theme toggle (persisted in `localStorage`).
   - Additional settings are currently UI-level only.
8. **Help & Docs**
   - Rule-based in-app support chat for common issues.

## ADB command mapping

The app currently uses these shell commands:

- `getprop ro.build.version.release`
- `getprop ro.product.model`
- `pm list packages`
- `pm list packages -s`
- `pm uninstall -k --user 0 <package>`

## Architecture overview

```text
src/
  main.tsx                  # React bootstrap
  App.tsx                   # Connected/unconnected shell + view routing
  components/
    WelcomeScreen.tsx       # Landing + connect CTA + instructions
  layouts/
    MainLayout.tsx          # Sidebar/header/content scaffold
    Sidebar.tsx             # View navigation state
    Header.tsx              # Session status + disconnect action
  views/
    PackageExplorerView.tsx # Package scan/filter/select/uninstall flow
    VariousViews.tsx        # Dashboard/Recommended/Backup/Logs/Settings
    HelpDocsView.tsx        # Local assistant chat UI
  hooks/
    useAdb.ts               # Connection lifecycle state
    useTheme.ts             # Light/dark theme persistence
  lib/
    adb.ts                  # WebADB manager + shell + event bus
    bloatware.ts            # Curated package metadata
```

## Key modules

### `src/lib/adb.ts`

- `WebAdbManager` wraps WebUSB device request, ADB auth, session storage, and shell execution.
- `shell()` emits command/log events to an in-memory `eventBus`.
- Exports:
  - `adbManager` (singleton)
  - `eventBus` (log stream pub/sub)
  - `LogEvent` type

### `src/hooks/useAdb.ts`

- Maintains `adb`, `connecting`, `error`, and `isConnected` state.
- Exposes `connect()` and `disconnect()` used by `App.tsx`.

### `src/views/PackageExplorerView.tsx`

- Loads installed packages from ADB.
- Enriches packages with optional `getBloatwareInfo()` metadata.
- Supports:
  - filter: `all | bloatware | safe`
  - multi-select + select-all
  - sequential batch uninstall with progress/result modal

### `src/views/VariousViews.tsx`

- `DashboardView`: device/app statistics.
- `RecommendedView`: OEM preset uninstall profiles.
- `BackupRestoreView`: package list export to JSON (session list is UI-only).
- `LogsView`: displays and exports `eventBus` logs.
- `SettingsView`: dark mode + static configuration switches.

## Theming

- Tokenized brand palette is defined in `src/index.css` using CSS variables.
- `useTheme()` toggles `.dark` on `documentElement` and persists choice in `localStorage` under key `theme`.

## Important behavior and limitations

- **No backend/cloud sync**: all operations are local to browser + connected device.
- **No persistent history**: logs and backup table in UI reset on reload (downloaded files remain on disk).
- **Restore is not fully implemented in UI**: backup feature currently exports package inventory only.
- **Safety Mode toggle is not enforced in logic yet**: uninstall safeguards rely on user choices and curated package metadata.
- **Uninstall scope**: commands target `--user 0`, which may disable app for the current user rather than physically deleting system partitions.

## Safety guidance

- Start with known-safe packages and OEM preset profiles.
- Always export a package snapshot before large removals.
- Avoid removing core system services (launcher, System UI, package installer, telephony, etc.).
- Recovery from critical removals may require factory reset.

## Troubleshooting

- Device not detected:
  - confirm USB debugging is enabled
  - re-plug cable/port
  - try Chrome or Edge
- Connect dialog opens but session fails:
  - accept RSA prompt on phone
  - revoke USB debugging authorizations and retry
- Commands fail intermittently:
  - reconnect device from app header
  - ensure screen is unlocked and cable is stable

## Future improvements (suggested)

- Real restore workflow (`cmd package install-existing` actions from backup file)
- Enforced protected-package rules for Safety Mode
- Persistent local storage for logs/backups metadata
- Device/OEM detection to auto-suggest profiles

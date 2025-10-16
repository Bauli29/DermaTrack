# ESLint & Prettier Configuration

Diese Dateien stellen eine grundlegende ESLint- und Prettier-Konfiguration für das DermaTrack Frontend bereit.

## 📁 Konfigurationsdateien

- **`.eslintrc.js`** - Hauptkonfiguration für ESLint
- **`.eslintignore`** - Dateien/Ordner die von ESLint ignoriert werden
- **`.prettierrc.json`** - Code-Formatierung Konfiguration  
- **`.prettierignore`** - Dateien/Ordner die von Prettier ignoriert werden

## 🚀 Verfügbare Scripts

```bash
# Linting
npm run lint          # ESLint auf alle Dateien anwenden
npm run lint:fix      # ESLint mit automatischen Fixes
npm run lint:check    # ESLint mit strikter Warnung-Kontrolle (für CI/CD)

# Formatierung
npm run format        # Code mit Prettier formatieren
npm run format:check  # Prüfen ob Code richtig formatiert ist (für CI/CD)
```

## 🔧 Aktuelle Konfiguration

### ESLint Rules
- **Next.js** - Optimiert für Next.js 13+ (App Router)
- **TypeScript** - Vollständige TypeScript-Unterstützung
- **React/JSX** - React 19 + Hooks optimiert
- **Code Quality** - Grundlegende Best Practices

### Prettier Settings
- **Single Quotes** - Für JavaScript/TypeScript
- **Semicolons** - Immer verwenden
- **Tab Width** - 2 Spaces
- **Print Width** - 80 Zeichen
- **Trailing Commas** - ES5 kompatibel

## 📈 Erweiterungsmöglichkeiten

Diese Konfiguration ist bewusst grundlegend gehalten und kann erweitert werden:

### Mögliche Ergänzungen:
1. **Accessibility** - `eslint-plugin-jsx-a11y`
2. **Import Sorting** - `eslint-plugin-import`
3. **Testing** - ESLint Regeln für Jest/Testing Library
4. **Performance** - `eslint-plugin-react-perf`
5. **Security** - `eslint-plugin-security`

### Team-spezifische Regeln:
- Code-Style Präferenzen anpassen
- Projekt-spezifische Regeln hinzufügen
- IDE Integration konfigurieren

## 🔄 CI/CD Integration

Die ESLint-Checks sind bereits in die GitHub Actions integriert:
- **Linting** - Automatische Code-Qualität Prüfung
- **Formatting** - Automatische Format-Validierung
- **Build** - Nur bei erfolgreichen Checks

## 💡 VS Code Integration

Für optimale Entwicklererfahrung empfohlene Erweiterungen:
- ESLint Extension
- Prettier Extension  
- Auto-Format on Save aktivieren

## 🎯 Nächste Schritte

1. Dependencies installieren: `npm install`
2. Erste Lint-Prüfung: `npm run lint`  
3. Konfiguration nach Team-Präferenzen anpassen
4. IDE-Integration einrichten
5. Bei Bedarf weitere Plugins hinzufügen

---

*Diese Konfiguration wurde als Basis erstellt und kann vom Team weiterentwickelt werden.*
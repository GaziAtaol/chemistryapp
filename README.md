# Chemistry Learning App

A modern, fast, and accessible chemistry learning web application for students, built with React + Vite + TypeScript.

## Features

### ✅ Completed
- **Interactive Periodic Table** - Color-coded elements with detailed information panels
- **Element Detail Panel** - Comprehensive properties, trends, and actions for each element
- **Multilingual Support** - Turkish/English language switching (i18n)
- **Theme System** - Light/Dark theme toggle with persistent settings
- **Search & Filtering** - Search elements by name, symbol, or atomic number
- **Category Filters** - Filter by element categories and blocks
- **Responsive Design** - Mobile-first design with tablet/desktop layouts
- **Accessibility** - WCAG compliant with keyboard navigation
- **Local Storage** - Offline data persistence
- **Settings Management** - Language, theme, font size, and data management
- **Modern UI** - Glass-effect cards, smooth animations, and custom CSS

### 🚧 Framework Ready (Components Created)
- **Quiz System** - Multiple question types with adaptive difficulty
- **Flashcards** - Leitner spaced repetition system
- **Favorites** - Save elements, questions, and notes
- **Notes** - Rich text notes linked to elements
- **Analytics** - Quiz history and performance tracking

## Tech Stack

- **Frontend**: React 19.1.1 + TypeScript
- **Build Tool**: Vite 7.1.6
- **Styling**: Custom CSS with CSS Variables
- **State Management**: React Hooks + LocalStorage
- **Icons**: Emoji icons (no external dependencies)
- **Language**: Turkish (default) + English

## Installation & Usage

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # React components
│   ├── Navigation/      # App navigation
│   ├── PeriodicTable/   # Periodic table & element details
│   ├── Quiz/           # Quiz system (framework)
│   ├── FlashCards/     # Flashcard system (framework)
│   └── Common/         # Shared components
├── data/               # Element data
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── styles/             # CSS styles
├── types/              # TypeScript type definitions
└── utils/              # Utilities (i18n, storage)
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with ES2020 support

## License

MIT License

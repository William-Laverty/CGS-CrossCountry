# 🏃‍♂️ CGS Cross Country Management System

A modern web application for managing cross country events and results at CGS. Built with React, TypeScript, and Supabase.

![Tech Stack](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73FE9?style=for-the-badge&logo=vite&logoColor=FFD62E)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- 🏆 Real-time race results tracking
- 📊 Performance analytics and statistics
- 👥 Athlete management system
- 📅 Event scheduling and management
- 🔐 Secure authentication system
- 📱 Responsive design for all devices

## 🛠 Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Backend**: Supabase
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Linting**: ESLint
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cgs-cross-country.git
cd cgs-cross-country
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── lib/           # Utility functions and configurations
├── App.tsx        # Main application component
├── main.tsx       # Application entry point
└── index.css      # Global styles
```

## 💻 Development

- Run the development server:
```bash
npm run dev
```

- Build for production:
```bash
npm run build
```

- Lint the code:
```bash
npm run lint
```

## 🚀 Deployment

This project is configured for deployment on Vercel. Simply push your changes to the main branch, and Vercel will automatically deploy your application.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [Your Name] 
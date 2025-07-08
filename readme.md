# Target App

A modern, full-stack React Native application for managing shooting sessions and targets, featuring real-time collaboration, authentication, and seamless integration with Supabase. Built with Expo, Tailwind CSS (NativeWind), and pnpm for efficient development and deployment.

---

## Features

- **Session Management:** Create, edit, and track shooting sessions.
- **Target Management:** Add, edit, and visualize targets with a custom canvas.
- **Authentication:** Secure sign-in/sign-up with Supabase Auth and RLS policies.
- **Real-Time Data:** Supabase-powered real-time updates for sessions and targets.
- **Responsive UI:** Built with Tailwind CSS and NativeWind for consistent styling.
- **State Management:** Efficient data fetching and caching with React Query.
- **Role-Based Access:** Fine-grained permissions using Supabase RLS.
- **Cross-Platform:** Runs on iOS, Android, and web via Expo.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (v8+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Supabase](https://supabase.com/) account

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/your-org/target-app.git
   cd target-app
   ```

2. **Install dependencies:**

   ```sh
   pnpm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local` and fill in your Supabase credentials.

4. **Run the app:**

   ```sh
   pnpm run dev
   ```

   - For Expo Go: `pnpm run start`
   - For web: `pnpm run web`

---

## Project Structure

```
.
├── app/                # Main application routes and screens
│   ├── (protected)/    # Authenticated routes (sessions, targets, etc.)
│   ├── auth/           # Authentication callbacks
│   └── welcome.tsx     # Welcome screen
├── components/         # UI components and forms
├── context/            # Providers (e.g., Supabase)
├── hooks/              # Custom React hooks
├── config/             # Configuration files (Supabase, etc.)
├── constants/          # App-wide constants (colors, etc.)
├── lib/                # Utilities and types
├── docs/               # Documentation and reports
├── scripts/            # Utility scripts
├── assets/             # Icons, images, splash screens
├── global.css          # Global styles
├── package.json        # Project manifest
├── tailwind.config.js  # Tailwind CSS config
├── supabase-rls-setup.sql # Supabase RLS policy setup
└── ...
```

---

## Authentication

- Uses Supabase Auth for secure user authentication.
- Row Level Security (RLS) policies are enforced for all data access.
- See [`supabase-rls-setup.sql`](./supabase-rls-setup.sql) and `docs/supabase-rls-policies.md` for details.

---

## State Management

- **React Query** is used for data fetching, caching, and synchronization.
- Custom hooks in `/hooks` encapsulate session, target, and placement logic.
- Context providers manage Supabase and global state.

---

## Styling

- **Tailwind CSS** (via NativeWind) for utility-first, cross-platform styling.
- Custom UI components in `/components/ui`.

---

## Environment Configuration

- Copy `.env.example` to `.env.local` and provide your Supabase project URL and anon/public key.
- Example:
  ```
  SUPABASE_URL=your-supabase-url
  SUPABASE_ANON_KEY=your-anon-key
  ```

---

## Testing & Linting

- **Linting:**
  ```sh
  pnpm run lint
  ```
- **Formatting:**
  ```sh
  pnpm run format
  ```
- (Add test instructions here if tests are present.)

---

## Deployment

- Build for production:
  ```sh
  pnpm run build
  ```
- Deploy using Expo or your preferred platform.

---

## Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

## Acknowledgements

- [Supabase](https://supabase.com/)
- [Expo](https://expo.dev/)
- [NativeWind](https://www.nativewind.dev/)
- [React Query](https://tanstack.com/query/latest)
- All contributors and open source libraries used in this project.

# Pump Guard Frontend - Claude AI Guidelines

## Critical Rules (MUST Follow)

### 1. Timestamps
- **ALWAYS** use `moment-timezone` for displaying timestamps
- Server sends Unix UTC seconds (Number)
- **ALWAYS** convert to user's local timezone for display
- Use `moment.unix(timestamp).tz(moment.tz.guess()).format()` for conversion
- Relative times: `moment.unix(timestamp).fromNow()` (e.g., "20h ago")
- Absolute times: `moment.unix(timestamp).tz(moment.tz.guess()).format("HH:mm")` (e.g., "21:00")

### 2. API Calls
- **ALWAYS** use `axiosInstance` from `~/utils/axiosInstance`
- **NEVER** use `fetch()` or raw `axios`
- All responses follow server format:
```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}
```

### 3. Imports
- **ALWAYS** use `~/` path alias (not `../`)
- Example: `import { axiosInstance } from "~/utils/axiosInstance"`

### 4. Language & Comments
- **ALWAYS** write in English (code, comments, variables, UI text)
- **MINIMAL** comments - code should be self-explanatory
- No emojis unless explicitly requested

### 5. Type Safety & Server Contract
- **NEVER** assume API response structure - always check server code first
- **ALWAYS** check `server/src/` for actual response types before creating frontend types
- When unsure about API contract, **ASK** the user or check server implementation
- Keep frontend types in sync with server responses

---

## Project Structure

```
client/
├── src/
│   ├── config/
│   │   └── env.ts              # Environment variables (Vite)
│   ├── utils/
│   │   ├── axiosInstance.ts    # Axios instance with interceptors
│   │   ├── time.ts             # Moment.js helpers
│   │   └── validators.ts       # Zod schemas for forms
│   ├── services/
│   │   └── api.ts              # API service functions
│   ├── hooks/
│   │   ├── useScanner.ts       # API hooks
│   │   └── useForm.ts          # Form hooks
│   ├── store/
│   │   └── index.ts            # Zustand store (future)
│   ├── types/
│   │   ├── api.ts              # API response types
│   │   └── index.ts            # Shared types
│   ├── components/
│   │   ├── common/             # Reusable components
│   │   └── features/           # Feature-specific components
│   ├── pages/
│   │   ├── Home.tsx
│   │   └── Report.tsx          # /report/:ca
│   ├── router/
│   │   └── index.tsx           # React Router setup
│   ├── App.tsx
│   └── main.tsx
├── .env.development
├── .env.production
├── vite.config.ts
└── tailwind.config.js
```

---

## Tech Stack

### Confirmed
- **Vite** - Build tool
- **React 18** + TypeScript
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Zod** - Validation
- **React Hook Form** - Form handling
- **moment-timezone** - Time formatting
- **axios** - HTTP client
- **Zustand** - State management (future)

### Not Using
- ~~Next.js~~ - using Vite
- ~~Redux~~ - using Zustand
- ~~fetch API~~ - using axios
- ~~date-fns~~ - using moment-timezone

---

## Code Patterns

### Environment Config
```typescript
// config/env.ts
const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  NODE_ENV: import.meta.env.MODE,
} as const;

export { env };
```

```env
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api

# .env.production
VITE_API_BASE_URL=https://api.pumpguard.com/api
```

### Axios Instance
```typescript
// utils/axiosInstance.ts
import axios from "axios";
import { env } from "~/config/env";

export const axiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    const message = error.response?.data?.message || "An error occurred";
    console.error("API Error:", message);
    return Promise.reject(error);
  }
);
```

### API Service
```typescript
// services/api.ts
import { axiosInstance } from "~/utils/axiosInstance";
import type { ApiResponse, TokenScanResult } from "~/types/api";

export const scannerApi = {
  scanToken: async (tokenAddress: string): Promise<TokenScanResult> => {
    const { data } = await axiosInstance.get<ApiResponse<TokenScanResult>>(
      `/scanner/scan/${tokenAddress}`
    );

    if (!data.success || !data.data) {
      throw new Error(data.message);
    }

    return data.data;
  },
};
```

### API Types
```typescript
// types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface TokenScanResult {
  tokenAddress: string;
  tokenInfo: {
    name: string;
    symbol: string;
    // ...
  };
  metrics: {
    riskScore: number;
    // ...
  };
  scannedAt: number; // Unix UTC seconds
}
```

### Time Formatting
```typescript
// utils/time.ts
import moment from "moment-timezone";

// Get user's timezone
export const getUserTimezone = () => moment.tz.guess();

// Convert Unix UTC to user's local time
export const formatTimestamp = (unixTimestamp: number, format = "HH:mm") => {
  return moment.unix(unixTimestamp).tz(getUserTimezone()).format(format);
};

// Relative time (e.g., "20h ago")
export const formatRelativeTime = (unixTimestamp: number) => {
  return moment.unix(unixTimestamp).fromNow();
};

// Full date and time
export const formatFullDateTime = (unixTimestamp: number) => {
  return moment.unix(unixTimestamp).tz(getUserTimezone()).format("MMM DD, YYYY HH:mm");
};
```

### Custom Hooks
```typescript
// hooks/useScanner.ts
import { useState } from "react";
import { scannerApi } from "~/services/api";
import type { TokenScanResult } from "~/types/api";

export const useScanner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TokenScanResult | null>(null);

  const scanToken = async (tokenAddress: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await scannerApi.scanToken(tokenAddress);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { scanToken, loading, error, data };
};
```

### Form Validation (Zod + React Hook Form)
```typescript
// utils/validators.ts
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";

export const tokenAddressSchema = z.string().refine(
  (value) => {
    try {
      new PublicKey(value);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid Solana address" }
);

// Component usage
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  tokenAddress: tokenAddressSchema,
});

type FormData = z.infer<typeof formSchema>;

const MyForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("tokenAddress")} />
      {errors.tokenAddress && <span>{errors.tokenAddress.message}</span>}
    </form>
  );
};
```

### React Router Setup
```typescript
// router/index.tsx
import { createBrowserRouter } from "react-router-dom";
import Home from "~/pages/Home";
import Report from "~/pages/Report";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/report/:ca",
    element: <Report />,
  },
]);

// main.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "~/router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

### Page Component Pattern
```typescript
// pages/Report.tsx
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useScanner } from "~/hooks/useScanner";
import { formatRelativeTime, formatTimestamp } from "~/utils/time";

const Report = () => {
  const { ca } = useParams<{ ca: string }>();
  const { scanToken, loading, error, data } = useScanner();

  useEffect(() => {
    if (ca) {
      scanToken(ca);
    }
  }, [ca]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return (
    <div>
      <h1>{data.tokenInfo.name}</h1>
      <p>Scanned: {formatRelativeTime(data.scannedAt)}</p>
      <p>Time: {formatTimestamp(data.scannedAt, "HH:mm")}</p>
    </div>
  );
};

export default Report;
```

---

## Common Mistakes to Avoid

❌ **DON'T**:
- Use `fetch()` API
- Use raw `axios`
- Use relative imports (`../utils`)
- Write comments for obvious code
- Use `Date.now()` or `new Date()`
- Display Unix timestamps directly

✅ **DO**:
- Use `axiosInstance`
- Use path aliases (`~/utils`)
- Use `moment-timezone` for all time display
- Keep code self-explanatory
- Write in English
- Convert timestamps to user's timezone

---

## Tailwind CSS Patterns

### Component Example
```tsx
const Button = ({ children, variant = "primary" }) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  };

  return (
    <button className={`${baseClasses} ${variants[variant]}`}>
      {children}
    </button>
  );
};
```

---

## Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~/*": ["./src/*"]
    }
  }
}
```

---

## Quick Reference

### Add New Page
1. Create component in `pages/`
2. Add route to `router/index.tsx`
3. Use `useParams()` for route params

### Add New API Endpoint
1. Add type to `types/api.ts`
2. Add function to `services/api.ts`
3. Create custom hook in `hooks/` if needed

### Add New Form
1. Create Zod schema in `utils/validators.ts`
2. Use `react-hook-form` with `zodResolver`
3. Handle submission in component

### Display Timestamp
```typescript
import { formatRelativeTime, formatTimestamp } from "~/utils/time";

// Relative: "20h ago"
<span>{formatRelativeTime(data.scannedAt)}</span>

// Absolute: "21:00" (user's timezone)
<span>{formatTimestamp(data.scannedAt, "HH:mm")}</span>

// Full: "Jan 27, 2025 21:00"
<span>{formatFullDateTime(data.scannedAt)}</span>
```

---

## Response Examples

### API Response (from server)
```json
{
  "success": true,
  "message": "Token scan completed",
  "data": {
    "tokenAddress": "...",
    "tokenInfo": { ... },
    "metrics": { ... },
    "scannedAt": 1706385600
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Only Pumpfun and Pumpswap tokens on Solana are supported",
  "data": null
}
```

---

## Zustand Store (Future)

```typescript
// store/index.ts
import { create } from "zustand";

interface AppStore {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export const useAppStore = create<AppStore>((set) => ({
  theme: "light",
  setTheme: (theme) => set({ theme }),
}));

// Usage
import { useAppStore } from "~/store";

const MyComponent = () => {
  const { theme, setTheme } = useAppStore();

  return <button onClick={() => setTheme("dark")}>Toggle Theme</button>;
};
```

---

## Remember

- **Plan before code** - understand the existing structure
- **Follow patterns** - look at existing code for consistency
- **Type safety** - use TypeScript strictly
- **User timezone** - always convert timestamps
- **Error handling** - show user-friendly messages
- **Loading states** - indicate when data is loading
- **Update this doc** - when patterns change

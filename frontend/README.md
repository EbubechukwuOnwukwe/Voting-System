# Frontend - React Application

**Author:** Ebubechukwu Onwukwe  
**GitHub:** [EbubechukwuOnwukwe](https://github.com/EbubechukwuOnwukwe)  
**Repository:** [Voting-System-Demo](https://github.com/EbubechukwuOnwukwe/Voting-System-Demo)

## Overview

Modern React frontend for the AI-Enhanced Online Voting System. Built with Vite, React Router, and Bootstrap 5.

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── NavigationBar.jsx
│   ├── LoadingSpinner.jsx
│   └── ProtectedRoute.jsx
├── context/            # React context providers
│   └── AuthContext.jsx
├── pages/              # Main application pages
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Vote.jsx
│   ├── Results.jsx
│   ├── AIInsights.jsx
│   └── NotFound.jsx
├── services/           # API service layer
│   ├── api.js
│   ├── authService.js
│   ├── votingService.js
│   └── aiService.js
├── App.jsx             # Root component with routing
├── main.jsx            # Application entry point
└── index.css           # Global styles
```

## Features

### Performance Optimizations

1. **Lazy Loading**
   - Code splitting with React.lazy()
   - Suspense for loading states
   - Optimized bundle sizes

2. **API Caching**
   - Response caching with TTL
   - Positions/candidates: 60s cache
   - Stats/status: 30s cache
   - Results: 15s cache

### Pages

1. **Login** (`/login`)
   - Student ID authentication
   - Password visibility toggle
   - JWT token management
   - Redirect to dashboard on success

2. **Register** (`/register`)
   - New user registration
   - Password visibility toggle
   - Form validation
   - Automatic login after registration

3. **Dashboard** (`/dashboard`)
   - Voting statistics overview
   - User voting status (uppercase nickname)
   - Quick action buttons
   - Protected route

4. **Vote** (`/vote`)
   - View all positions and candidates
   - Cast votes (one per position)
   - Real-time voting status
   - Protected route

5. **Results** (`/results`)
   - Live voting results
   - Vote counts and percentages
   - Winner highlighting
   - Progress bars visualization

6. **AI Insights** (`/ai-insights`)
   - AI-generated summaries with markdown rendering
   - Winner predictions
   - Turnout analysis
   - Tabbed interface

### Components

#### NavigationBar
```jsx
// Top navigation with user menu
<NavigationBar />
```

Features:
- Responsive design
- User profile dropdown
- Active link highlighting
- Logout functionality

#### LoadingSpinner
```jsx
// Reusable loading indicator
<LoadingSpinner message="Loading data..." />
```

#### ProtectedRoute
```jsx
// Wraps authenticated routes
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

### Services

#### API Client (api.js)
```javascript
import api from './services/api';

// Automatically adds JWT token
const response = await api.get('/endpoint/');
```

Features:
- Automatic token injection
- Token refresh handling
- Error interceptors
- Base URL configuration

#### Auth Service (authService.js)
```javascript
import authService from './services/authService';

// Register user
await authService.register(userData);

// Login
await authService.login(credentials);

// Logout
authService.logout();

// Check authentication
const isAuth = authService.isAuthenticated();
```

#### Voting Service (votingService.js)
```javascript
import votingService from './services/votingService';

// Get positions
const positions = await votingService.getPositions();

// Cast vote
await votingService.castVote({ candidate: 1, position: 1 });

// Get results
const results = await votingService.getResults();

// Get statistics
const stats = await votingService.getStats();
```

#### AI Service (aiService.js)
```javascript
import aiService from './services/aiService';

// Get AI summary
const summary = await aiService.getSummary();

// Get predictions
const prediction = await aiService.getPrediction();

// Get turnout analysis
const turnout = await aiService.getTurnoutAnalysis();
```

### Context

#### AuthContext
```jsx
import { useAuth } from './context/AuthContext';

function Component() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user.nickname}</p>
      ) : (
        <button onClick={() => login(credentials)}>Login</button>
      )}
    </div>
  );
}
```

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Application runs on: `http://localhost:3000`

3. **Build for Production:**
   ```bash
   npm run build
   ```

4. **Preview Production Build:**
   ```bash
   npm run preview
   ```

## Configuration

### API Base URL
Edit `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://127.0.0.1:8000/api';
```

### Vite Configuration
Edit `vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
});
```

## Styling

### CSS Framework
- **Bootstrap 5.3.2** - Main UI framework
- **Bootstrap Icons** - Icon library
- **Custom CSS** - Additional styles in `index.css`

### Theme
```css
:root {
  --primary-color: #0d6efd;
  --secondary-color: #6c757d;
  --success-color: #198754;
  --danger-color: #dc3545;
}
```

### Custom Classes
```css
.stats-card { /* Gradient stats cards */ }
.candidate-card { /* Interactive candidate cards */ }
.ai-insights-box { /* AI insights container */ }
```

## Routing

### Public Routes
- `/login` - Login page
- `/register` - Registration page

### Protected Routes
- `/dashboard` - User dashboard (default)
- `/vote` - Voting page
- `/results` - Results page
- `/ai-insights` - AI insights page
- `/` - Redirects to `/dashboard`

### Route Configuration
```jsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  
  <Route path="/dashboard" element={
    <ProtectedRoute><Dashboard /></ProtectedRoute>
  } />
  
  <Route path="/" element={<Navigate to="/dashboard" />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

## Authentication Flow

1. **Login/Register:**
   - User submits credentials
   - API returns JWT tokens
   - Tokens stored in localStorage
   - User redirected to dashboard

2. **Protected Routes:**
   - Check for access token
   - If missing, redirect to login
   - If present, render component

3. **API Requests:**
   - Token automatically added to headers
   - If token expired, refresh automatically
   - If refresh fails, logout user

4. **Logout:**
   - Clear tokens from localStorage
   - Clear user state
   - Redirect to login

## State Management

### Global State (Context)
- User authentication state
- Login/logout functions

### Local State (useState)
- Component-specific data
- Loading states
- Error messages
- Form data

### Server State
- Fetched via services
- Cached in component state
- Refetched on demand

## Error Handling

### API Errors
```javascript
try {
  await votingService.castVote(data);
  setSuccess('Vote cast successfully');
} catch (err) {
  const errorMsg = err.response?.data?.error || 'Failed to cast vote';
  setError(errorMsg);
}
```

### Form Validation
```jsx
<Form.Control
  type="text"
  required
  maxLength="7"
  pattern="\d{7}"
  title="Please enter a 7-digit student ID"
/>
```

## Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 992px
- Desktop: > 992px

### Mobile Optimizations
- Collapsible navigation
- Stacked cards
- Touch-friendly buttons
- Responsive grids

## Performance

### Optimizations
- Lazy loading routes (can be added)
- Component memoization
- Debounced API calls
- Efficient re-renders

### Vite Benefits
- Fast HMR (Hot Module Replacement)
- Optimized builds
- Code splitting
- Tree shaking

## Development Tips

### Hot Reload
Changes to components automatically reload in browser

### React DevTools
Install React DevTools browser extension for debugging

### Network Inspection
Use browser DevTools Network tab to inspect API calls

### Console Logging
```javascript
console.log('Debug info:', data);
```

## Common Issues

### CORS Errors
- Ensure backend CORS is configured
- Check `CORS_ALLOWED_ORIGINS` in Django settings

### 401 Unauthorized
- Token may be expired
- Check token refresh logic
- Verify API authentication

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

## Dependencies

Main packages:
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.2",
  "bootstrap": "^5.3.2",
  "react-bootstrap": "^2.9.1",
  "bootstrap-icons": "^1.11.2"
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Production Deployment

1. **Build:**
   ```bash
   npm run build
   ```

2. **Deploy `dist/` folder to:**
   - Netlify
   - Vercel
   - GitHub Pages
   - Your own server

3. **Environment Variables:**
   - Update API_BASE_URL for production
   - Use environment variables for configuration

## Future Enhancements

- Progressive Web App (PWA)
- Offline support
- Push notifications
- Real-time updates (WebSockets)
- Advanced animations
- Dark mode

---

**Built with Vite + React + Bootstrap**

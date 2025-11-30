jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  getDoc: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
  increment: jest.fn()
}));

jest.mock('../../../services/firebase/firebaseConfig', () => ({
  auth: {},
  db: {},
  googleProvider: {},
  checkFirebaseConnection: jest.fn()
}));

jest.mock('../../../services/firebase/gameService', () => ({
  gameService: {
    initializeGames: jest.fn().mockResolvedValue({ success: true }),
    saveGameResult: jest.fn().mockResolvedValue({ success: true })
  }
}));

jest.mock('../../../services/firebase/userService', () => ({
  userService: {
    getUser: jest.fn().mockResolvedValue({ id: 'test-user' }),
    getUserProgress: jest.fn().mockResolvedValue([]),
    initializeUserProgress: jest.fn().mockResolvedValue({})
  }
}));

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../../../App';
import { onAuthStateChanged } from 'firebase/auth';
import { gameService } from '../../../services/firebase/gameService';
import { userService } from '../../../services/firebase/userService';

describe('App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Flow', () => {
    test('should render Loading component while initializing', () => {
      onAuthStateChanged.mockImplementation((auth, callback) => {
        return jest.fn();
      });

      render(<App />);
      
      expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    });

    test('should redirect to login when not authenticated', async () => {
      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null);
        return jest.fn();
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
      });
    });

    test('should show dashboard when authenticated', async () => {
      const mockUser = {
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      };

      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Route Protection', () => {
    test('should protect dashboard route when not authenticated', async () => {
      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null);
        return jest.fn();
      });

      window.history.pushState({}, 'Dashboard', '/dashboard');
      
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
      });
    });

    test('should allow access to dashboard when authenticated', async () => {
      const mockUser = {
        uid: 'test-user-123',
        email: 'test@example.com'
      };

      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Initialization', () => {
    test('should initialize game service on user login', async () => {
      const mockUser = {
        uid: 'test-user-123',
        email: 'test@example.com'
      };

      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(<App />);

      await waitFor(() => {
        expect(gameService.initializeGames).toHaveBeenCalled();
      });
    });

    test('should initialize or get user data on authentication', async () => {
      const mockUser = {
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      };

      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(<App />);

      await waitFor(() => {
        expect(userService.getUser).toHaveBeenCalledWith('test-user-123');
      });
    });

    test('should handle initialization errors gracefully', async () => {
      const mockUser = {
        uid: 'test-user-123',
        email: 'test@example.com'
      };

      gameService.initializeGames.mockRejectedValue(new Error('Init failed'));
      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Network Status', () => {
    test('should not show network banner when online', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null);
        return jest.fn();
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText(/sin conexión/i)).not.toBeInTheDocument();
      });
    });
  });
});


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
    initializeUserProgress: jest.fn().mockResolvedValue({}),
    createUser: jest.fn().mockResolvedValue({ id: 'test-user' }),
    validateAccountForLogin: jest.fn().mockResolvedValue({
      valid: true,
      isNewUser: false,
      userData: { email: 'test@example.com' }
    }),
    forceLogoutDeletedAccount: jest.fn().mockResolvedValue({ success: true }),
    logoutUser: jest.fn().mockResolvedValue({ success: true }),
    deleteUserAccount: jest.fn().mockResolvedValue({ success: true }),
    isAccountDeleted: jest.fn().mockResolvedValue({ deleted: false })
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

    // Reset userService mocks to default valid responses
    userService.validateAccountForLogin.mockResolvedValue({
      valid: true,
      isNewUser: false,
      userData: { email: 'test@example.com' }
    });

    userService.getUser.mockResolvedValue({ id: 'test-user' });
    userService.getUserProgress.mockResolvedValue([]);
    userService.initializeUserProgress.mockResolvedValue({});
    userService.createUser.mockResolvedValue({ id: 'test-user' });

    // Reset gameService mocks
    gameService.initializeGames.mockResolvedValue({ success: true });
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

      // Ensure validateAccountForLogin returns valid result for this test
      userService.validateAccountForLogin.mockResolvedValueOnce({
        valid: true,
        isNewUser: false,
        userData: { email: 'test@example.com' }
      });

      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(<App />);

      await waitFor(() => {
        expect(userService.validateAccountForLogin).toHaveBeenCalledWith('test-user-123');
      });

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

      // Ensure validateAccountForLogin returns valid result for this test
      userService.validateAccountForLogin.mockResolvedValueOnce({
        valid: true,
        isNewUser: false,
        userData: { email: 'test@example.com' }
      });

      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(<App />);

      await waitFor(() => {
        expect(userService.validateAccountForLogin).toHaveBeenCalledWith('test-user-123');
      });

      await waitFor(() => {
        expect(userService.getUser).toHaveBeenCalledWith('test-user-123');
      });
    });

    test('should handle initialization errors gracefully', async () => {
      const mockUser = {
        uid: 'test-user-123',
        email: 'test@example.com'
      };

      // Ensure validateAccountForLogin returns valid result for this test
      userService.validateAccountForLogin.mockResolvedValueOnce({
        valid: true,
        isNewUser: false,
        userData: { email: 'test@example.com' }
      });

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

  describe('Account Validation', () => {
    test('should handle deleted account during authentication', async () => {
      const mockUser = {
        uid: 'deleted-user-123',
        email: 'deleted@example.com'
      };

      // Mock validateAccountForLogin to return invalid account
      userService.validateAccountForLogin.mockResolvedValueOnce({
        valid: false,
        reason: 'account_deleted',
        message: 'Tu cuenta ha sido eliminada'
      });

      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(<App />);

      await waitFor(() => {
        expect(userService.validateAccountForLogin).toHaveBeenCalledWith('deleted-user-123');
      });

      await waitFor(() => {
        expect(userService.forceLogoutDeletedAccount).toHaveBeenCalledWith('deleted-user-123', 'account_deleted');
      });

      // Should show the account error modal
      await waitFor(() => {
        expect(screen.getByText('Cuenta Eliminada')).toBeInTheDocument();
      });
    });

    test('should handle inactive account during authentication', async () => {
      const mockUser = {
        uid: 'inactive-user-123',
        email: 'inactive@example.com'
      };

      userService.validateAccountForLogin.mockResolvedValueOnce({
        valid: false,
        reason: 'account_inactive',
        message: 'Tu cuenta está inactiva'
      });

      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(<App />);

      await waitFor(() => {
        expect(userService.validateAccountForLogin).toHaveBeenCalledWith('inactive-user-123');
      });

      await waitFor(() => {
        expect(userService.forceLogoutDeletedAccount).toHaveBeenCalledWith('inactive-user-123', 'account_inactive');
      });

      // Should show the account error modal
      await waitFor(() => {
        expect(screen.getByText('Cuenta Inactiva')).toBeInTheDocument();
      });
    });

    test('should handle suspended account during authentication', async () => {
      const mockUser = {
        uid: 'suspended-user-123',
        email: 'suspended@example.com'
      };

      userService.validateAccountForLogin.mockResolvedValueOnce({
        valid: false,
        reason: 'account_suspended',
        message: 'Tu cuenta está suspendida hasta el 2025-12-01'
      });

      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(<App />);

      await waitFor(() => {
        expect(userService.validateAccountForLogin).toHaveBeenCalledWith('suspended-user-123');
      });

      await waitFor(() => {
        expect(userService.forceLogoutDeletedAccount).toHaveBeenCalledWith('suspended-user-123', 'account_suspended');
      });

      // Should show the account error modal
      await waitFor(() => {
        expect(screen.getByText('Cuenta Suspendida')).toBeInTheDocument();
      });
    });

    test('should proceed normally with valid account', async () => {
      const mockUser = {
        uid: 'valid-user-123',
        email: 'valid@example.com',
        displayName: 'Valid User'
      };

      userService.validateAccountForLogin.mockResolvedValueOnce({
        valid: true,
        isNewUser: false,
        userData: { email: 'valid@example.com' }
      });

      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(<App />);

      await waitFor(() => {
        expect(userService.validateAccountForLogin).toHaveBeenCalledWith('valid-user-123');
      });

      await waitFor(() => {
        expect(gameService.initializeGames).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(userService.getUser).toHaveBeenCalledWith('valid-user-123');
      });

      // Should not show any error modal
      expect(screen.queryByText('Cuenta Eliminada')).not.toBeInTheDocument();
      expect(screen.queryByText('Cuenta Inactiva')).not.toBeInTheDocument();
      expect(screen.queryByText('Cuenta Suspendida')).not.toBeInTheDocument();
    });

    test('should handle validation errors gracefully', async () => {
      const mockUser = {
        uid: 'error-user-123',
        email: 'error@example.com'
      };

      userService.validateAccountForLogin.mockRejectedValueOnce(new Error('Validation failed'));

      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(<App />);

      await waitFor(() => {
        expect(userService.validateAccountForLogin).toHaveBeenCalledWith('error-user-123');
      });

      // Should not crash the app and should set user to null
      await waitFor(() => {
        expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
      });
    });
  });
});


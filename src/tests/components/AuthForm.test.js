// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    signInWithPopup: jest.fn()
}));

// Mock Firebase Config
jest.mock('../../services/firebase/firebaseConfig', () => ({
    auth: {},
    googleProvider: {
        setCustomParameters: jest.fn()
    },
    checkFirebaseConnection: jest.fn()
}));

// Mock UserService
jest.mock('../../services/firebase/userService', () => ({
    userService: {
        validateAccountForLogin: jest.fn().mockResolvedValue({
            valid: true,
            isNewUser: false,
            userData: { email: 'test@example.com' }
        })
    }
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthForm from '../../components/common/AuthForm/AuthForm';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { userService } from '../../services/firebase/userService';

describe('AuthForm Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Email/Password Authentication', () => {
        test('should handle valid login with account validation', async () => {
            const mockUserCredential = {
                user: { uid: 'test-user-123', email: 'test@example.com' }
            };

            signInWithEmailAndPassword.mockResolvedValueOnce(mockUserCredential);
            userService.validateAccountForLogin.mockResolvedValueOnce({
                valid: true,
                isNewUser: false,
                userData: { email: 'test@example.com' }
            });

            render(<AuthForm />);

            const emailInput = screen.getByLabelText(/correo electrónico/i);
            const passwordInput = screen.getByLabelText(/contraseña/i);
            const submitButton = screen.getByRole('button', { name: /ingresar/i });

            await userEvent.type(emailInput, 'test@example.com');
            await userEvent.type(passwordInput, 'password123');
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(signInWithEmailAndPassword).toHaveBeenCalledWith({}, 'test@example.com', 'password123');
            });

            await waitFor(() => {
                expect(userService.validateAccountForLogin).toHaveBeenCalledWith('test-user-123');
            });

            await waitFor(() => {
                expect(screen.getByText(/inicio de sesión exitoso/i)).toBeInTheDocument();
            });
        });

        test('should handle deleted account during login', async () => {
            const mockUserCredential = {
                user: { uid: 'deleted-user-123', email: 'deleted@example.com' }
            };

            signInWithEmailAndPassword.mockResolvedValueOnce(mockUserCredential);
            userService.validateAccountForLogin.mockResolvedValueOnce({
                valid: false,
                reason: 'account_deleted',
                message: 'Tu cuenta ha sido eliminada'
            });

            render(<AuthForm />);

            const emailInput = screen.getByLabelText(/correo electrónico/i);
            const passwordInput = screen.getByLabelText(/contraseña/i);
            const submitButton = screen.getByRole('button', { name: /ingresar/i });

            await userEvent.type(emailInput, 'deleted@example.com');
            await userEvent.type(passwordInput, 'password123');
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(signInWithEmailAndPassword).toHaveBeenCalledWith({}, 'deleted@example.com', 'password123');
            });

            await waitFor(() => {
                expect(userService.validateAccountForLogin).toHaveBeenCalledWith('deleted-user-123');
            });

            await waitFor(() => {
                expect(signOut).toHaveBeenCalledWith({});
            });

            await waitFor(() => {
                expect(screen.getByText(/tu cuenta ha sido eliminada/i)).toBeInTheDocument();
            });
        });

        test('should handle inactive account during login', async () => {
            const mockUserCredential = {
                user: { uid: 'inactive-user-123', email: 'inactive@example.com' }
            };

            signInWithEmailAndPassword.mockResolvedValueOnce(mockUserCredential);
            userService.validateAccountForLogin.mockResolvedValueOnce({
                valid: false,
                reason: 'account_inactive',
                message: 'Tu cuenta está inactiva'
            });

            render(<AuthForm />);

            const emailInput = screen.getByLabelText(/correo electrónico/i);
            const passwordInput = screen.getByLabelText(/contraseña/i);
            const submitButton = screen.getByRole('button', { name: /ingresar/i });

            await userEvent.type(emailInput, 'inactive@example.com');
            await userEvent.type(passwordInput, 'password123');
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(userService.validateAccountForLogin).toHaveBeenCalledWith('inactive-user-123');
            });

            await waitFor(() => {
                expect(signOut).toHaveBeenCalledWith({});
            });

            await waitFor(() => {
                expect(screen.getByText(/tu cuenta está inactiva/i)).toBeInTheDocument();
            });
        });

        test('should handle suspended account during login', async () => {
            const mockUserCredential = {
                user: { uid: 'suspended-user-123', email: 'suspended@example.com' }
            };

            signInWithEmailAndPassword.mockResolvedValueOnce(mockUserCredential);
            userService.validateAccountForLogin.mockResolvedValueOnce({
                valid: false,
                reason: 'account_suspended',
                message: 'Tu cuenta está suspendida hasta el 2025-12-01'
            });

            render(<AuthForm />);

            const emailInput = screen.getByLabelText(/correo electrónico/i);
            const passwordInput = screen.getByLabelText(/contraseña/i);
            const submitButton = screen.getByRole('button', { name: /ingresar/i });

            await userEvent.type(emailInput, 'suspended@example.com');
            await userEvent.type(passwordInput, 'password123');
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(userService.validateAccountForLogin).toHaveBeenCalledWith('suspended-user-123');
            });

            await waitFor(() => {
                expect(signOut).toHaveBeenCalledWith({});
            });

            await waitFor(() => {
                expect(screen.getByText(/tu cuenta está suspendida hasta el 2025-12-01/i)).toBeInTheDocument();
            });
        });
    });

    describe('Google Authentication', () => {
        test('should handle valid Google login with account validation', async () => {
            const mockUserCredential = {
                user: { uid: 'google-user-123', email: 'google@example.com' }
            };

            signInWithPopup.mockResolvedValueOnce(mockUserCredential);
            userService.validateAccountForLogin.mockResolvedValueOnce({
                valid: true,
                isNewUser: false,
                userData: { email: 'google@example.com' }
            });

            render(<AuthForm />);

            const googleButton = screen.getByText(/continuar con google/i);
            await userEvent.click(googleButton);

            await waitFor(() => {
                expect(signInWithPopup).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(userService.validateAccountForLogin).toHaveBeenCalledWith('google-user-123');
            });

            await waitFor(() => {
                expect(screen.getByText(/inicio de sesión con google exitoso/i)).toBeInTheDocument();
            });
        });

        test('should handle deleted account during Google login', async () => {
            const mockUserCredential = {
                user: { uid: 'deleted-google-user-123', email: 'deleted-google@example.com' }
            };

            signInWithPopup.mockResolvedValueOnce(mockUserCredential);
            userService.validateAccountForLogin.mockResolvedValueOnce({
                valid: false,
                reason: 'account_deleted',
                message: 'Tu cuenta ha sido eliminada'
            });

            render(<AuthForm />);

            const googleButton = screen.getByText(/continuar con google/i);
            await userEvent.click(googleButton);

            await waitFor(() => {
                expect(signInWithPopup).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(userService.validateAccountForLogin).toHaveBeenCalledWith('deleted-google-user-123');
            });

            await waitFor(() => {
                expect(signOut).toHaveBeenCalledWith({});
            });

            await waitFor(() => {
                expect(screen.getByText(/tu cuenta ha sido eliminada/i)).toBeInTheDocument();
            });
        });
    });

    describe('Form Validation', () => {
        test('should show validation errors for invalid email', async () => {
            render(<AuthForm />);

            const emailInput = screen.getByLabelText(/correo electrónico/i);
            const passwordInput = screen.getByLabelText(/contraseña/i);
            const submitButton = screen.getByRole('button', { name: /ingresar/i });

            await userEvent.type(emailInput, 'invalid-email');
            await userEvent.type(passwordInput, 'password123');
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/el correo no es válido/i)).toBeInTheDocument();
            });

            expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
        });

        test('should show validation errors for short password', async () => {
            render(<AuthForm />);

            const emailInput = screen.getByLabelText(/correo electrónico/i);
            const passwordInput = screen.getByLabelText(/contraseña/i);
            const submitButton = screen.getByRole('button', { name: /ingresar/i });

            await userEvent.type(emailInput, 'test@example.com');
            await userEvent.type(passwordInput, '123');
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
            });

            expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
        });
    });

    describe('Registration', () => {
        test('should handle successful registration', async () => {
            const mockUserCredential = {
                user: { uid: 'new-user-123', email: 'new@example.com' }
            };

            createUserWithEmailAndPassword.mockResolvedValueOnce(mockUserCredential);

            render(<AuthForm />);

            // Switch to registration mode
            const switchButton = screen.getByText(/¿no tienes cuenta\? regístrate/i);
            await userEvent.click(switchButton);

            const emailInput = screen.getByLabelText(/correo electrónico/i);
            const passwordInput = screen.getByLabelText(/contraseña/i);
            const submitButton = screen.getByRole('button', { name: /registrarse/i });

            await userEvent.type(emailInput, 'new@example.com');
            await userEvent.type(passwordInput, 'password123');
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(createUserWithEmailAndPassword).toHaveBeenCalledWith({}, 'new@example.com', 'password123');
            });

            await waitFor(() => {
                expect(screen.getByText(/registro exitoso/i)).toBeInTheDocument();
            });
        });
    });
});
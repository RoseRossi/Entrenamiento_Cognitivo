import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../../pages/Dashboard/Dashboard';

jest.mock('../../../services/firebase/firebaseConfig', () => ({
  auth: {}
}));

describe('Dashboard Component', () => {

  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('Basic Rendering', () => {
    test('should render dashboard title', () => {
      renderWithRouter(<Dashboard />);
      expect(screen.getByText('Train Your Brain')).toBeInTheDocument();
    });

    test('should render section title for games', () => {
      renderWithRouter(<Dashboard />);
      expect(screen.getByText('Juegos Cognitivos')).toBeInTheDocument();
    });

    test('should render user profile button', () => {
      renderWithRouter(<Dashboard />);
      const profileBtn = screen.getByTitle('Mi perfil');
      expect(profileBtn).toBeInTheDocument();
    });

    test('should render reports section', () => {
      renderWithRouter(<Dashboard />);
      expect(screen.getByText('Reportes y Análisis')).toBeInTheDocument();
    });
  });

  describe('Game Cards', () => {
    test('should render all 8 game cards', () => {
      renderWithRouter(<Dashboard />);

      expect(screen.getByText('Razonamiento gramatical')).toBeInTheDocument();
      expect(screen.getByText('Matrices progresivas')).toBeInTheDocument();
      expect(screen.getByText('Aprendizaje de listas verbales')).toBeInTheDocument();
      expect(screen.getByText('Balance de balanza')).toBeInTheDocument();
      expect(screen.getByText('Reconocimiento de objetos')).toBeInTheDocument();
      expect(screen.getByText('Posner haciendo cola')).toBeInTheDocument();
      expect(screen.getByText('Forward memory span')).toBeInTheDocument();
      expect(screen.getByText('Reverse memory span')).toBeInTheDocument();
    });

    test('should have correct links for all games', () => {
      renderWithRouter(<Dashboard />);

      const links = screen.getAllByRole('link');
      const gameLinks = links.filter(link => link.getAttribute('href')?.startsWith('/juego/'));

      expect(gameLinks).toHaveLength(8);
      expect(gameLinks.some(link => link.getAttribute('href') === '/juego/1')).toBe(true);
      expect(gameLinks.some(link => link.getAttribute('href') === '/juego/2')).toBe(true);
      expect(gameLinks.some(link => link.getAttribute('href') === '/juego/8')).toBe(true);
    });

    test('should render game icons', () => {
      renderWithRouter(<Dashboard />);

      const icons = ['🧠', '🧩', '👁️', '🔍', '⚡', '♟️', '🎯', '🔄'];
      icons.forEach(icon => {
        expect(screen.getByText(icon)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Elements', () => {
    test('should render user profile button with correct title', () => {
      renderWithRouter(<Dashboard />);

      const profileBtn = screen.getByTitle('Mi perfil');
      expect(profileBtn).toBeInTheDocument();
    });

    test('should render reports button with correct text', () => {
      renderWithRouter(<Dashboard />);

      const reportsBtn = screen.getByText('Ver Reportes');
      expect(reportsBtn).toBeInTheDocument();
    });
  });

  describe('Reports Section', () => {
    test('should render reports description', () => {
      renderWithRouter(<Dashboard />);

      expect(screen.getByText(/visualiza tu progreso/i)).toBeInTheDocument();
    });

    test('should render reports button', () => {
      renderWithRouter(<Dashboard />);

      expect(screen.getByText('Ver Reportes')).toBeInTheDocument();
    });

    test('should render reports icon', () => {
      renderWithRouter(<Dashboard />);

      expect(screen.getByText('📊')).toBeInTheDocument();
      expect(screen.getByText('📈')).toBeInTheDocument();
    });
  });
});


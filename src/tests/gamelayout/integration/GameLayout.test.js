import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GameLayout from '../../../components/Games/GameLayout/GameLayout';

describe('GameLayout Component', () => {

  const defaultProps = {
    title: 'Test Game',
    description: 'This is a test game description',
    stats: {
      nivel: 1,
      puntuacion: 10,
      fallos: 2,
      tiempo: 45
    },
    children: <div data-testid="game-content">Game Content</div>
  };

  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('Active Game State', () => {
    test('should render game title', () => {
      renderWithRouter(<GameLayout {...defaultProps} />);
      expect(screen.getByText('Test Game')).toBeInTheDocument();
    });

    test('should render game description', () => {
      renderWithRouter(<GameLayout {...defaultProps} />);
      expect(screen.getByText('This is a test game description')).toBeInTheDocument();
    });

    test('should render stats panel with nivel', () => {
      renderWithRouter(<GameLayout {...defaultProps} />);
      expect(screen.getByText('Nivel')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    test('should render stats panel with puntuación', () => {
      renderWithRouter(<GameLayout {...defaultProps} />);
      expect(screen.getByText('Puntuación')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    test('should render stats panel with fallos', () => {
      renderWithRouter(<GameLayout {...defaultProps} />);
      expect(screen.getByText('Fallos')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    test('should render stats panel with formatted time', () => {
      renderWithRouter(<GameLayout {...defaultProps} />);
      expect(screen.getByText('Tiempo')).toBeInTheDocument();
      expect(screen.getByText('00:45')).toBeInTheDocument();
    });

    test('should render children content', () => {
      renderWithRouter(<GameLayout {...defaultProps} />);
      expect(screen.getByTestId('game-content')).toBeInTheDocument();
      expect(screen.getByText('Game Content')).toBeInTheDocument();
    });

    test('should render fullscreen toggle button', () => {
      renderWithRouter(<GameLayout {...defaultProps} />);
      const fullscreenBtn = screen.getByLabelText(/pantalla completa/i);
      expect(fullscreenBtn).toBeInTheDocument();
    });

    test('should format time correctly for different values', () => {
      const props = { ...defaultProps, stats: { ...defaultProps.stats, tiempo: 125 } };
      renderWithRouter(<GameLayout {...props} />);
      expect(screen.getByText('02:05')).toBeInTheDocument();
    });
  });

  describe('Instructions Screen', () => {
    test('should render instructions when showInstructions is true', () => {
      const props = {
        ...defaultProps,
        showInstructions: true,
        instructions: <div>Test Instructions</div>,
        onStartGame: jest.fn()
      };

      renderWithRouter(<GameLayout {...props} />);
      
      expect(screen.getByText('Test Instructions')).toBeInTheDocument();
      expect(screen.getByText('Comenzar Juego')).toBeInTheDocument();
    });

    test('should call onStartGame when button clicked', () => {
      const onStartGame = jest.fn();
      const props = {
        ...defaultProps,
        showInstructions: true,
        instructions: <div>Test Instructions</div>,
        onStartGame
      };

      renderWithRouter(<GameLayout {...props} />);
      
      const startButton = screen.getByText('Comenzar Juego');
      fireEvent.click(startButton);
      
      expect(onStartGame).toHaveBeenCalled();
    });

    test('should not render game stats on instructions screen', () => {
      const props = {
        ...defaultProps,
        showInstructions: true,
        instructions: <div>Instructions</div>,
        onStartGame: jest.fn()
      };

      renderWithRouter(<GameLayout {...props} />);
      
      expect(screen.queryByText('Nivel')).not.toBeInTheDocument();
    });
  });

  describe('Game Over Screen', () => {
    test('should render game over screen when gameOver is true', () => {
      const props = {
        ...defaultProps,
        gameOver: true,
        finalStats: {
          level: 5,
          score: 85,
          mistakes: 3,
          timeRemaining: 30
        },
        onRestart: jest.fn()
      };

      renderWithRouter(<GameLayout {...props} />);
      
      expect(screen.getByText('Juego Terminado')).toBeInTheDocument();
    });

    test('should render congratulations when game completed', () => {
      const props = {
        ...defaultProps,
        gameOver: true,
        finalStats: {
          completed: true,
          level: 10,
          score: 100
        },
        onRestart: jest.fn()
      };

      renderWithRouter(<GameLayout {...props} />);
      
      expect(screen.getByText('¡Felicidades!')).toBeInTheDocument();
    });

    test('should render final stats on game over', () => {
      const props = {
        ...defaultProps,
        gameOver: true,
        finalStats: {
          level: 5,
          score: 85,
          mistakes: 3,
          timeRemaining: 30
        },
        onRestart: jest.fn()
      };

      renderWithRouter(<GameLayout {...props} />);
      
      expect(screen.getByText('Nivel alcanzado:')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Puntuación final:')).toBeInTheDocument();
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('Fallos:')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    test('should render restart button', () => {
      const props = {
        ...defaultProps,
        gameOver: true,
        finalStats: { level: 5 },
        onRestart: jest.fn()
      };

      renderWithRouter(<GameLayout {...props} />);
      
      expect(screen.getByText('Jugar de nuevo')).toBeInTheDocument();
    });

    test('should call onRestart when restart button clicked', () => {
      const onRestart = jest.fn();
      const props = {
        ...defaultProps,
        gameOver: true,
        finalStats: { level: 5 },
        onRestart
      };

      renderWithRouter(<GameLayout {...props} />);
      
      const restartBtn = screen.getByText('Jugar de nuevo');
      fireEvent.click(restartBtn);
      
      expect(onRestart).toHaveBeenCalled();
    });

    test('should render home button', () => {
      const props = {
        ...defaultProps,
        gameOver: true,
        finalStats: { level: 5 },
        onRestart: jest.fn()
      };

      renderWithRouter(<GameLayout {...props} />);
      
      expect(screen.getByText('Volver al inicio')).toBeInTheDocument();
    });

    test('should render home button with correct text', () => {
      const props = {
        ...defaultProps,
        gameOver: true,
        finalStats: { level: 5 },
        onRestart: jest.fn()
      };

      renderWithRouter(<GameLayout {...props} />);
      
      const homeBtn = screen.getByText('Volver al inicio');
      expect(homeBtn).toBeInTheDocument();
    });

    test('should render analysis when provided', () => {
      const props = {
        ...defaultProps,
        gameOver: true,
        finalStats: { level: 5 },
        onRestart: jest.fn(),
        analysis: 'You performed excellently!'
      };

      renderWithRouter(<GameLayout {...props} />);
      
      expect(screen.getByText('Análisis:')).toBeInTheDocument();
      expect(screen.getByText('You performed excellently!')).toBeInTheDocument();
    });

    test('should not render analysis when not provided', () => {
      const props = {
        ...defaultProps,
        gameOver: true,
        finalStats: { level: 5 },
        onRestart: jest.fn()
      };

      renderWithRouter(<GameLayout {...props} />);
      
      expect(screen.queryByText('Análisis:')).not.toBeInTheDocument();
    });
  });

  describe('Stats Display', () => {
    test('should handle missing stats gracefully', () => {
      const props = {
        title: 'Test Game',
        description: 'Test',
        children: <div>Content</div>
      };

      renderWithRouter(<GameLayout {...props} />);
      
      expect(screen.getByText('Test Game')).toBeInTheDocument();
    });

    test('should display zero time as 00:00', () => {
      const props = {
        ...defaultProps,
        stats: { ...defaultProps.stats, tiempo: 0 }
      };

      renderWithRouter(<GameLayout {...props} />);
      
      expect(screen.getByText('00:00')).toBeInTheDocument();
    });

    test('should display time over 60 seconds correctly', () => {
      const props = {
        ...defaultProps,
        stats: { ...defaultProps.stats, tiempo: 125 }
      };

      renderWithRouter(<GameLayout {...props} />);
      
      expect(screen.getByText('02:05')).toBeInTheDocument();
    });
  });
});


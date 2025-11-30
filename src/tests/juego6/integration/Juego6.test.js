import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Juego6 from '../../../components/Games/juego6/Juego6';

jest.mock('../../../services/firebase/firebaseConfig', () => ({
  auth: { currentUser: { uid: 'test-user' } }
}));

jest.mock('../../../services/firebase/gameService', () => ({
  gameService: {
    saveGameResult: jest.fn().mockResolvedValue({ success: true })
  }
}));

jest.mock('../../../services/firebase/userService', () => ({
  userService: {
    getUser: jest.fn().mockResolvedValue({ id: 'test-user' })
  }
}));

describe('Juego6 - Posner Haciendo Cola - Component Rendering', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  test('should render without crashing', () => {
    render(
      <BrowserRouter>
        <Juego6 />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Señalización de Posner - Progresivo')).toBeInTheDocument();
  });

  test('should render within GameLayout', () => {
    render(
      <BrowserRouter>
        <Juego6 />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Comenzar Juego')).toBeInTheDocument();
  });

  test('should show instructions screen initially', () => {
    render(
      <BrowserRouter>
        <Juego6 />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Comenzar Juego')).toBeInTheDocument();
  });
});


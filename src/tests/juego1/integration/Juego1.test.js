import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Juego1 from '../../../components/Games/juego1/Juego1';

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

describe('Juego1 - Razonamiento Gramatical - Component Rendering', () => {
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
        <Juego1 />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Juego de Formas Lógicas')).toBeInTheDocument();
  });

  test('should render within GameLayout', () => {
    render(
      <BrowserRouter>
        <Juego1 />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Comenzar Juego')).toBeInTheDocument();
  });

  test('should show instructions screen initially', () => {
    render(
      <BrowserRouter>
        <Juego1 />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Comenzar Juego')).toBeInTheDocument();
  });
});


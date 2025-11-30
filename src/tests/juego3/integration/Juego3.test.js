import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Juego3 from '../../../components/Games/juego3/juego3';

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

describe('Juego3 - Aprendizaje de Listas Verbales - Component Rendering', () => {
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
        <Juego3 />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Aprendizaje de Listas Verbales')).toBeInTheDocument();
  });

  test('should render within GameLayout', () => {
    render(
      <BrowserRouter>
        <Juego3 />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Comenzar Juego')).toBeInTheDocument();
  });

  test('should show instructions screen initially', () => {
    render(
      <BrowserRouter>
        <Juego3 />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Comenzar Juego')).toBeInTheDocument();
  });
});


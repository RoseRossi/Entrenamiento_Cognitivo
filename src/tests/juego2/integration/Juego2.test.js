import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Juego2 from '../../../components/Games/juego2/Juego2';

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

describe('Juego2 - Matrices Progresivas - Component Rendering', () => {
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
        <Juego2 />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Juego de Matrices Progresivas')).toBeInTheDocument();
  });

  test('should render within GameLayout', () => {
    render(
      <BrowserRouter>
        <Juego2 />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Comenzar Juego')).toBeInTheDocument();
  });

  test('should show instructions screen initially', () => {
    render(
      <BrowserRouter>
        <Juego2 />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Comenzar Juego')).toBeInTheDocument();
  });
});


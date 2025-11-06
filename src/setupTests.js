// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock PixelBlast component to prevent WebGL/Three.js issues in tests
jest.mock('./components/common/PixelBlast/PixelBlast', () => {
  return function MockPixelBlast(props) {
    // Use the global React from jest environment
    const React = require('react');
    return React.createElement('div', {
      'data-testid': 'pixel-blast-mock',
      className: 'pixel-blast-mock',
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(45deg, #001f29, #003d5c)',
        zIndex: -1
      }
    });
  };
});

// Mock HTMLMediaElement (Audio) for tests
window.HTMLMediaElement.prototype.load = () => { /* do nothing */ };
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => { /* do nothing */ };

// Suppress React Router future flag warnings in tests
const originalWarn = console.warn;
const originalLog = console.log;
const originalError = console.error;

beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('React Router Future Flag Warning') ||
        args[0].includes('v7_startTransition') ||
        args[0].includes('v7_relativeSplatPath') ||
        args[0].includes('PixelBlast') ||
        args[0].includes('error boundary'))
    ) {
      return;
    }
    originalWarn(...args);
  };

  console.log = (...args) => {
    // Suppress specific GameLayout prop logs and App auth logs
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Prop onFallo recibida:') ||
        args[0].includes('Prop onCorrectAnswer recibida:') ||
        args[0].includes('Usuario autenticado:') ||
        args[0].includes('Usuario no autenticado') ||
        args[0].includes('Inicializando datos') ||
        args[0].includes('Usuario ya existe') ||
        args[0].includes('Inicialización completa'))
    ) {
      return;
    }
    originalLog(...args);
  };

  console.error = (...args) => {
    // Suppress HTMLMediaElement, WebGL, Canvas, and PixelBlast-related errors
    if (
      args[0]?.message?.includes('Not implemented: HTMLMediaElement') ||
      args[0]?.toString().includes('Not implemented: HTMLMediaElement') ||
      args[0]?.message?.includes('HTMLCanvasElement.prototype.getContext') ||
      args[0]?.toString().includes('HTMLCanvasElement.prototype.getContext') ||
      args[0]?.message?.includes('error is not a function') ||
      args[0]?.toString().includes('error is not a function') ||
      (typeof args[0] === 'string' && args[0].includes('Error inicializando datos')) ||
      (typeof args[0] === 'string' && args[0].includes('PixelBlast'))
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.log = originalLog;
  console.error = originalError;
});

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

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
       args[0].includes('v7_relativeSplatPath'))
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
    // Suppress HTMLMediaElement not implemented errors and App initialization errors
    if (
      args[0]?.message?.includes('Not implemented: HTMLMediaElement') ||
      args[0]?.toString().includes('Not implemented: HTMLMediaElement') ||
      (typeof args[0] === 'string' && args[0].includes('Error inicializando datos'))
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

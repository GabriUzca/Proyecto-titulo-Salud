import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from './App';

// Mock de useAuth para simular logueado/no logueado
vi.mock('./hooks/useAuth', () => ({
  useAuth: () => ({ estaLogueado: false, cargando: false }) // cambia a true para probar acceso
}));

test('si no está logueado, redirige a /login', () => {
  render(<MemoryRouter initialEntries={['/inicio']}><App/></MemoryRouter>);
  expect(screen.getByText(/¡Bienvenido de nuevo!/i)).toBeInTheDocument(); // está en la pantalla de login
});

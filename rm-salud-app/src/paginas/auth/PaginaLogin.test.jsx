import { test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PaginaLogin from './PaginaLogin';

// Caso 1: Credenciales inválidas
test('muestra error si las credenciales fallan', async () => {
  const user = userEvent.setup();
  const mockLogin = vi.fn().mockRejectedValueOnce(new Error('bad creds'));

  render(
    <MemoryRouter>
      <PaginaLogin alIniciarSesion={mockLogin} />
    </MemoryRouter>
  );

  await user.type(screen.getByPlaceholderText(/usuario o correo/i), 'gabi');
  await user.type(screen.getByPlaceholderText(/contraseña/i), 'wrongpass');
  await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

  expect(await screen.findByText(/credenciales inválidas/i)).toBeInTheDocument();
});

// Caso 2: Credenciales válidas
test('llama a alIniciarSesion si el login es exitoso', async () => {
  const user = userEvent.setup();
  const mockLogin = vi.fn().mockResolvedValueOnce({}); // simula éxito

  render(
    <MemoryRouter>
      <PaginaLogin alIniciarSesion={mockLogin} />
    </MemoryRouter>
  );

  await user.type(screen.getByPlaceholderText(/usuario o correo/i), 'gabi');
  await user.type(screen.getByPlaceholderText(/contraseña/i), 'secret123');
  await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

  // Verifica que la función de login fue llamada con las credenciales correctas
  expect(mockLogin).toHaveBeenCalledWith({
    emailOrUsername: 'gabi',
    password: 'secret123',
  });
});

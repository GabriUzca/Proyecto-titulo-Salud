import { test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom'; // 👈 importante
import PaginaLogin from './PaginaLogin';

test('login envía credenciales y muestra error si falla', async () => {
  const user = userEvent.setup();
  const mockLogin = vi.fn().mockRejectedValueOnce(new Error('bad creds'));

  // 👇 aquí lo envolvemos en MemoryRouter
  render(
    <MemoryRouter>
      <PaginaLogin alIniciarSesion={mockLogin} />
    </MemoryRouter>
  );

  await user.type(screen.getByPlaceholderText(/usuario o correo/i), 'gabi');
  await user.type(screen.getByPlaceholderText(/contraseña/i), 'secret123');
  await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

  expect(await screen.findByText(/credenciales inválidas/i)).toBeInTheDocument();
  expect(mockLogin).toHaveBeenCalledWith({
    emailOrUsername: 'gabi',
    password: 'secret123',
  });
});

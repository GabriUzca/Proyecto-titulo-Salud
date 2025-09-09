import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaginaLogin from './PaginaLogin';

test('login envía credenciales y muestra error si falla', async () => {
  const user = userEvent.setup();
  const mockLogin = vi.fn().mockRejectedValueOnce(new Error('bad creds'));

  render(<PaginaLogin alIniciarSesion={mockLogin} />);

  await user.type(screen.getByPlaceholderText(/usuario o correo/i), 'gabi');
  await user.type(screen.getByPlaceholderText(/contraseña/i), 'secret123');
  await user.click(screen.getByRole('button', {name: /iniciar sesión/i}));

  // al fallar muestra error
  expect(await screen.findByText(/credenciales inválidas/i)).toBeInTheDocument();
  expect(mockLogin).toHaveBeenCalledWith({ emailOrUsername: 'gabi', password: 'secret123' });
});

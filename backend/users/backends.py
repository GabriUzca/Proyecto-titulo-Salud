from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()


class EmailOrUsernameBackend(ModelBackend):
    """
    Backend de autenticación personalizado que permite iniciar sesión
    con nombre de usuario O correo electrónico.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Autentica un usuario usando username o email.

        Args:
            request: La solicitud HTTP
            username: Puede ser el username o el email del usuario
            password: La contraseña del usuario

        Returns:
            User si la autenticación es exitosa, None de lo contrario
        """
        if username is None or password is None:
            return None

        try:
            # Buscar usuario por username O email
            user = User.objects.get(
                Q(username=username) | Q(email=username)
            )
        except User.DoesNotExist:
            # Ejecutar el hasher de contraseña por defecto para evitar ataques de timing
            User().set_password(password)
            return None
        except User.MultipleObjectsReturned:
            # Si hay múltiples usuarios con el mismo email, intentar con username primero
            user = User.objects.filter(username=username).first()
            if not user:
                return None

        # Verificar la contraseña
        if user.check_password(password) and self.user_can_authenticate(user):
            return user

        return None

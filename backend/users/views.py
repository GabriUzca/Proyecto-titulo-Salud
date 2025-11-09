from rest_framework import generics, permissions
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, UserSerializer, UserProfileUpdateSerializer, CustomTokenObtainPairSerializer
from .models import UserProfile

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class MeUpdateView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileUpdateSerializer

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Vista personalizada para login que permite autenticación
    con username O email.

    Usa CustomTokenObtainPairSerializer que a su vez utiliza
    el backend EmailOrUsernameBackend.
    """
    serializer_class = CustomTokenObtainPairSerializer
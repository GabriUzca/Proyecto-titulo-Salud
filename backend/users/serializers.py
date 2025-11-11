from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('edad', 'peso', 'altura', 'sexo')

class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    edad = serializers.SerializerMethodField()
    peso = serializers.SerializerMethodField()
    altura = serializers.SerializerMethodField()
    sexo = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'profile', 'edad', 'peso', 'altura', 'sexo')
        #                                                   ⭐ AGREGADO is_staff, edad, peso, altura, sexo

    def get_profile(self, obj):
        profile, created = UserProfile.objects.get_or_create(user=obj)
        return UserProfileSerializer(profile).data

    def get_edad(self, obj):
        profile, created = UserProfile.objects.get_or_create(user=obj)
        return profile.edad

    def get_peso(self, obj):
        profile, created = UserProfile.objects.get_or_create(user=obj)
        return profile.peso

    def get_altura(self, obj):
        profile, created = UserProfile.objects.get_or_create(user=obj)
        return profile.altura

    def get_sexo(self, obj):
        profile, created = UserProfile.objects.get_or_create(user=obj)
        return profile.sexo


class UserAdminSerializer(serializers.ModelSerializer):

    profile = serializers.SerializerMethodField()
    total_actividades = serializers.SerializerMethodField()
    total_comidas = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 
            'is_active', 'is_staff', 'date_joined', 'last_login',
            'profile', 'total_actividades', 'total_comidas'
        )
        read_only_fields = ('id', 'date_joined', 'last_login')
    
    def get_profile(self, obj):
        """Retorna información del perfil"""
        profile, created = UserProfile.objects.get_or_create(user=obj)
        return UserProfileSerializer(profile).data
    
    def get_total_actividades(self, obj):
        """Cuenta el total de actividades del usuario"""
        return obj.actividades.count()
    
    def get_total_comidas(self, obj):
        """Cuenta el total de comidas del usuario"""
        return obj.comidas.count()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(allow_blank=True, required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def validate_email(self, value):
        if value and User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        UserProfile.objects.get_or_create(user=user)
        return user


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    edad = serializers.IntegerField(required=False, min_value=0, allow_null=True)
    peso = serializers.FloatField(required=False, min_value=0, allow_null=True)
    altura = serializers.FloatField(required=False, min_value=0, allow_null=True)
    sexo = serializers.CharField(required=False, allow_null=True)
    first_name = serializers.CharField(required=False, source='user.first_name')
    last_name = serializers.CharField(required=False, source='user.last_name')

    class Meta:
        model = UserProfile
        fields = ["first_name", "last_name", "edad", "peso", "altura", "sexo"]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})

        # Actualizar User
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()

        # Actualizar UserProfile
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializador personalizado para JWT que permite autenticación
    con username O email.

    El campo 'username' acepta tanto el nombre de usuario como el email.
    """

    def validate(self, attrs):
        """
        Valida las credenciales usando el backend personalizado.

        El backend EmailOrUsernameBackend se encarga de verificar
        si el valor en 'username' corresponde a un username o email.
        """
        # El padre (TokenObtainPairSerializer) llama a authenticate()
        # que usará nuestro EmailOrUsernameBackend configurado en settings
        return super().validate(attrs)
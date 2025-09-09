from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('edad', 'peso', 'altura')

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'profile')

class RegisterSerializer(serializers.ModelSerializer):
    # SUBIDO a 8
    password = serializers.CharField(write_only=True, min_length=8)
    # Permitimos email vacío, pero si viene, lo validamos
    email = serializers.EmailField(allow_blank=True, required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def validate_email(self, value):
        # Unicidad case-insensitive
        if value and User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        UserProfile.objects.create(user=user)
        return user

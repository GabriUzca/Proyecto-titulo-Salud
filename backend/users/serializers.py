from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile

class RegisterSerializer(serializers.ModelSerializer):
    # de 6 → 8
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(allow_blank=True, required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def validate_email(self, value):
        # unicidad (case-insensitive)
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

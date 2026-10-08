from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate

User = get_user_model()


class RegisterationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "password", "confirm_password"]

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError(
                {"password": "password_fields didn't match"}
            )
        return data

    def validate_email(self, value):
        return value.strip().lower()

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data.pop("confirm_password")
        user = User.objects.create_user(password=password, **validated_data)
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "email_verified")
        read_only_fields = ("id", "email", "email_verified")


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data['email'].strip().lower()
        password = data['password']

        user = authenticate(
            request=self.context.get("request"),
            email=email, 
            password=password
        )

        if user is None:
            raise serializers.ValidationError(
                "Invalid email or password."
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                "This account is inactive."
            )
        if not user.email_verified:
            raise serializers.ValidationError(
                "Please verify your email before logging in."
            )
        
        data["user"] = user

        return data


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_new_password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = self.context.get("request").user

        if not user.check_password(data["current_password"]):
            raise serializers.ValidationError({"current_password": "Current password is incorrect."})

        if data["new_password"] != data["confirm_new_password"]:
            raise serializers.ValidationError({"new_password": "Passwords do not match."})

        validate_password(data["new_password"],user=user)

        return data



'''
{
  "email": "john@gmail.com",
  "password": "Shibith1234",
  "confirm_password": "Shibith1234",
  "first_name": "John",
  "last_name": "Doe"
}
'''
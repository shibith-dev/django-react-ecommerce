from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework import generics

from .serializers import RegisterationSerializer, LoginSerializer, UserSerializer, ChangePasswordSerializer
from .tokens import get_tokens_for_user

# Create your views here.


class RegisterUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user_data = UserSerializer(user).data
        return Response(
            {
                "message": "Registration successful. Please verify your email.",
                "user": user_data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user_data = serializer.validated_data["user"]
        tokens = get_tokens_for_user(user_data)
        return Response(
            {**tokens, "user": UserSerializer(user_data).data},
            status=status.HTTP_200_OK,
        )

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response({"details": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response({"detail": "Invalid refresh token."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)

class ChangePassword(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=['password', 'updated_at'])
        return Response({"details": "Password changed successfully."}, status=status.HTTP_200_OK)

class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user



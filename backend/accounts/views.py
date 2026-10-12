from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework import generics
from django.db import transaction
from django.contrib.auth import get_user_model

from .serializers import RegisterationSerializer, LoginSerializer, UserSerializer, ChangePasswordSerializer, VerificationEmailSerializer, ResendVerificationSerializer, ForgotPasswordSerializer, ResetPasswordSerializer
from .tokens import get_tokens_for_user

from .tasks import send_verification_email, send_password_reset_email

User = get_user_model()

# Create your views here.


class RegisterUserView(APIView):
    serializer_class = RegisterationSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        transaction.on_commit(
            lambda: send_verification_email.delay(user.id)
        )

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


class verifyEmailView(APIView):
    permission_classes=[permissions.AllowAny]

    def post(self, request):
        serializer = VerificationEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.user

        if not user.email_verified:
            user.email_verified = True
            user.save(update_fields=["email_verified"])

        return Response({
            "deatil": "Email verified successfully. you can log in."
        }, status=status.HTTP_200_OK)


class ResendVerificationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].strip().lower()

        user = User.objects.filter(email__iexact=email, is_active=True, email_verified=False).first()

        if user:
            transaction.on_commit(lambda: send_verification_email.delay(user.id))

        return Response(
            {
                "detail": "If an eligible account exists, a verification email will be sent."
            },status=status.HTTP_200_OK,
        )

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].strip().lower()

        user = User.objects.filter(email__iexact=email, is_active=True).first()

        if user:
            transaction.on_commit(lambda: send_password_reset_email.delay(user.id))

        return Response(
            {
                "detail": (
                    "If an account exists for this email, "
                    "password reset instructions will be sent."
                )
            },
            status=status.HTTP_200_OK,
        )


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])

        return Response(
            {"detail": "Password reset successfully. You can now log in."},
            status=status.HTTP_200_OK,
        )
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from django.db import transaction
from django.contrib.auth import get_user_model
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_protect

from django.conf import settings

from .serializers import RegisterationSerializer, LoginSerializer, UserSerializer, ChangePasswordSerializer, VerificationEmailSerializer, ResendVerificationSerializer, ForgotPasswordSerializer, ResetPasswordSerializer
from .tokens import get_tokens_for_user

from .tasks import send_verification_email, send_password_reset_email

User = get_user_model()

def demo_mode_blocked():
    return Response(
        {"detail": "This feature is unavailable in demo mode."},
        status=status.HTTP_403_FORBIDDEN,
    )


def set_fresh_cookie(response, token):
    response.set_cookie(
        key = settings.AUTH_REFRESH_COOKIE_NAME,
        value=token,
        max_age = int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        httponly = settings.AUTH_REFRESH_COOKIE_HTTPONLY,
        secure=settings.AUTH_REFRESH_COOKIE_SECURE,
        samesite=settings.AUTH_REFRESH_COOKIE_SAMESITE,
        path=settings.AUTH_REFRESH_COOKIE_PATH
    )

# Create your views here.

@ensure_csrf_cookie # Its primary job is to force Django to send the csrf token.
@require_GET # Restricts other HTTP requests other than GET.
@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def csrf_cookie_view(request):
    return Response({"detail": "CSRF cookie set"})


class RegisterUserView(APIView):
    serializer_class = RegisterationSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if settings.DEMO_MODE:
            return demo_mode_blocked()

        serializer = RegisterationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        if settings.ENABLE_EMAIL_TASKS:
            transaction.on_commit(lambda: send_verification_email.delay(user.id))

        user_data = UserSerializer(user).data
        return Response(
            {
                "message": "Registration successful. Please verify your email.",
                "user": user_data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginUserView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    @method_decorator(csrf_protect)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == status.HTTP_200_OK:
            refresh_token = response.data.pop("refresh", None)
            if refresh_token:
                set_fresh_cookie(response, refresh_token)

        return response


class CookieTokenRefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    @method_decorator(csrf_protect)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request):
        refresh_token = request.COOKIES.get(settings.AUTH_REFRESH_COOKIE_NAME)

        if not refresh_token:
            return Response({"detail": "Refresh token is missing."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = TokenRefreshSerializer(data={"refresh": refresh_token})
        serializer.is_valid(raise_exception=True)
        data = dict(serializer.validated_data)
        rotated_refresh = data.pop("refresh", None)

        response = Response(data, status=status.HTTP_200_OK)

        if rotated_refresh:
            set_fresh_cookie(response, rotated_refresh)

        return response
    

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @method_decorator(csrf_protect)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)
    
    def post(self, request):
        refresh_token = request.COOKIES.get(settings.AUTH_REFRESH_COOKIE_NAME)

        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except (TokenError, InvalidToken):
                # The token may already be invalid or expired.
                pass

        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie(
            key=settings.AUTH_REFRESH_COOKIE_NAME,
            path=settings.AUTH_REFRESH_COOKIE_PATH,
            samesite=settings.AUTH_REFRESH_COOKIE_SAMESITE,
        )

        return response


class ChangePassword(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if settings.DEMO_MODE:
            return demo_mode_blocked()
        
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
        if settings.DEMO_MODE:
            return demo_mode_blocked()
        
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
        if settings.DEMO_MODE:
            return demo_mode_blocked()
        
        serializer = ResendVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].strip().lower()

        user = User.objects.filter(email__iexact=email, is_active=True, email_verified=False).first()

        if user and settings.ENABLE_EMAIL_TASKS:
            transaction.on_commit(lambda: send_verification_email.delay(user.id))

        return Response(
            {
                "detail": "If an eligible account exists, a verification email will be sent."
            },status=status.HTTP_200_OK,
        )

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if settings.DEMO_MODE:
            return demo_mode_blocked()

        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].strip().lower()

        user = User.objects.filter(email__iexact=email, is_active=True).first()

        if user and settings.ENABLE_EMAIL_TASKS:
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
        if settings.DEMO_MODE:
            return demo_mode_blocked()
        
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])

        return Response(
            {"detail": "Password reset successfully. You can now log in."},
            status=status.HTTP_200_OK,
        )
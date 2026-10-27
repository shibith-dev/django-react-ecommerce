from django.urls import path
from .views import (
    RegisterUserView,
    LoginUserView,
    LogoutView,
    ChangePassword,
    MeView,
    ResendVerificationView,
    ResetPasswordView,
    verifyEmailView,
    ForgotPasswordView,
    csrf_cookie_view,
    CookieTokenRefreshView,
)

urlpatterns = [
    path("register/", RegisterUserView.as_view(), name="register"),
    path("login/", LoginUserView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("change-password/", ChangePassword.as_view(), name="change_password"),
    path("me/", MeView.as_view(), name="me"),
    path("refresh/", CookieTokenRefreshView.as_view(), name="token-refresh"),
    path("verify-email/", verifyEmailView.as_view(), name="verify-email"),
    path("resend-verification/", ResendVerificationView.as_view(), name="resend-verification"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
    path("csrf/", csrf_cookie_view, name="auth-csrf"),
]

from django.urls import path
from .views import RegisterUserView, LoginUserView, LogoutView, ChangePassword, MeView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name="register"),
    path('login/', LoginUserView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name="logout"),
    path('change-password/', ChangePassword.as_view(), name="change_password"),
    path('me/', MeView.as_view(), name="me"),
    path('refresh/', TokenRefreshView.as_view(), name="token-refresh")
]
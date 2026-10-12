from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import signing
from django.core.mail import send_mail
from django.urls import reverse
from celery import shared_task

from urllib.parse import urlencode

User = get_user_model()

VERIFICATION_SALT = "chrono.email-verification"
VERIFICATION_MAX_AGE = 60 * 60 * 24  # 24 hours

@shared_task(bind=True, max_retrices=3, default_retry_delay=60)
def send_verification_email(self, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return

    if user.email_verified or not user.is_active:
        return

    token = signing.dumps(
        {
            "user_id": str(user.id),
            "email": user.email
        },
        salt=VERIFICATION_SALT
    )

    query = urlencode({"token": token})
    verification_url = (f"{settings.FRONTEND_URL.strip().rstrip('/')}/verify-email?{query}")

    subject = "verify your chrono account"
    message = (
        f"Hello {user.first_name or "there"},\n\n"
        "Thanks for registering with chrono.\nVerify your email address using this link:\n\n"
        f"{verification_url}\n\n"
        "This link expires in 24 hours. If you did not create this account, ignore this email."
    )

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False
        )
    except Exception as e:
        raise self.retry(exc=e)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_password_reset_email(self, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.userDoesNotExist:
        return

    if not user.is_active:
        return

    token = default_token_generator.make_token(user)

    query = urlencode({
        "uid": str(user.id),
        "token": token
    })
    reset_url = (f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?{query}")

    message = (
        "we received a request to reset you Chrono password.\n\nUse the following link to choose a new passowrd.\n\n"
        f"{reset_url}\n\n"
        "If you did not request this, ignore this email."
    )

    try:
        send_mail(
            subject="Reset your Chrono password",
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False
        )
    except Exception as e:
        raise self.retry(exc=e)


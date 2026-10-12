from django.contrib.auth import get_user_model
from django.core import signing
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.tasks import VERIFICATION_SALT

User = get_user_model()


class EmailVerificationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="watchbuyer@example.com",
            password="StrongPassword123!",
        )
        self.url = reverse("verify-email")

    def make_token(self):
        return signing.dumps(
            {
                "user_id": str(self.user.pk),
                "email": self.user.email,
            },
            salt=VERIFICATION_SALT,
        )

    def test_valid_token_verifies_account(self):
        response = self.client.post(
            self.url,
            {"token": self.make_token()},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertTrue(self.user.email_verified)

    def test_invalid_token_is_rejected(self):
        response = self.client.post(
            self.url,
            {"token": "invalid-token"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.user.refresh_from_db()
        self.assertFalse(self.user.email_verified)

    def test_token_cannot_verify_another_users_email(self):
        other_user = User.objects.create_user(
            email="anotherbuyer@example.com",
            password="StrongPassword123!",
        )

        response = self.client.post(
            self.url,
            {"token": self.make_token()},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        other_user.refresh_from_db()
        self.assertFalse(other_user.email_verified)
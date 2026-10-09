from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthenticationAPITests(APITestCase):

    def setUp(self):
        self.register_url = reverse("register")
        self.login_url = reverse("login")
        self.refresh_url = reverse("token-refresh")
        self.logout_url = reverse("logout")
        self.me_url = reverse("me")
        self.change_password_url = reverse("change_password")

        self.password = "StrongPassword123!"

        self.user = User.objects.create_user(
            email="user@example.com",
            password=self.password,
            first_name="John",
            last_name="Doe",
            email_verified=True,
        )

    def authenticate(self):
        response = self.client.post(
            self.login_url,
            {
                "email": self.user.email,
                "password": self.password,
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        access_token = response.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        return response


    def test_register_user(self):
        response = self.client.post(
            self.register_url,
            {
                "email": "new@example.com",
                "first_name": "Jane",
                "last_name": "Doe",
                "password": self.password,
                "confirm_password": self.password,
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(email="new@example.com")

        self.assertFalse(user.email_verified)
        self.assertTrue(user.check_password(self.password))


    def test_duplicate_email_is_rejected(self):
        response = self.client.post(
            self.register_url,
            {
                "email": self.user.email,
                "first_name": "John",
                "last_name": "Doe",
                "password": self.password,
                "password_confirm": self.password,
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


    def test_unverified_user_cannot_login(self):
        self.user.email_verified = False
        self.user.save(update_fields=["email_verified"])

        response = self.client.post(
            self.login_url,
            {
                "email": self.user.email,
                "password": self.password,
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


    def test_verified_user_can_login(self):
        response = self.client.post(
            self.login_url,
            {
                "email": self.user.email,
                "password": self.password,
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["email"], self.user.email)


    def test_wrong_password_is_rejected(self):
        response = self.client.post(
            self.login_url,
            {
                "email": self.user.email,
                "password": "WrongPassword123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


    def test_me_requires_authentication(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


    def test_me_returns_current_user(self):
        self.authenticate()

        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)


    def test_me_can_update_profile(self):
        self.authenticate()

        response = self.client.patch(
            self.me_url,
            {
                "first_name": "Updated",
                "last_name": "Name",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()

        self.assertEqual(self.user.first_name, "Updated")
        self.assertEqual(self.user.last_name, "Name")


    def test_email_cannot_be_changed(self):
        self.authenticate()

        response = self.client.patch(
            self.me_url,
            {
                "email": "attacker@example.com",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()

        self.assertEqual(self.user.email, "user@example.com")


    def test_password_change(self):
        self.authenticate()

        new_password = "NewStrongPassword123!"

        response = self.client.post(
            self.change_password_url,
            {
                "current_password": self.password,
                "new_password": new_password,
                "confirm_new_password": new_password,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()

        self.assertTrue(self.user.check_password(new_password))


    def test_password_change_requires_current_password(self):
        self.authenticate()

        response = self.client.post(
            self.change_password_url,
            {
                "current_password": "WrongPassword123!",
                "new_password": "NewStrongPassword123!",
                "new_password_confirm": "NewStrongPassword123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


    def test_refresh_token_returns_new_access_token(self):
        login_response = self.client.post(
            self.login_url,
            {
                "email": self.user.email,
                "password": self.password,
            },
            format="json",
        )

        refresh_token = login_response.data["refresh"]

        response = self.client.post(
            self.refresh_url,
            {
                "refresh": refresh_token,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)


    def test_logout_blacklists_refresh_token(self):
        login_response = self.client.post(
            self.login_url,
            {
                "email": self.user.email,
                "password": self.password,
            },
            format="json",
        )

        refresh_token = login_response.data["refresh"]

        self.authenticate()

        response = self.client.post(
            self.logout_url,
            {
                "refresh": refresh_token,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.post(
            self.refresh_url,
            {
                "refresh": refresh_token,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
from django.contrib.auth import get_user_model
from django.test import TestCase


User = get_user_model()


class UserModelTests(TestCase):

    def test_create_user(self):
        user = User.objects.create_user(
            email="user@example.com",
            password="StrongPassword123!",
        )

        self.assertEqual(user.email, "user@example.com")
        self.assertTrue(user.check_password("StrongPassword123!"))
        self.assertFalse(user.email_verified)

    def test_create_user_without_email_fails(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(
                email="",
                password="StrongPassword123!",
            )

    def test_password_is_hashed(self):
        password = "StrongPassword123!"

        user = User.objects.create_user(
            email="user@example.com",
            password=password,
        )

        self.assertNotEqual(user.password, password)
        self.assertTrue(user.check_password(password))

    def test_create_superuser(self):
        user = User.objects.create_superuser(
            email="admin@example.com",
            password="StrongPassword123!",
        )

        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_active)
        self.assertTrue(user.email_verified)
from django.contrib.auth import get_user_model
from django.test import TestCase

from accounts.serializers import RegisterationSerializer

user = get_user_model()

class RegitserSerialzierTests(TestCase):
    def test_valid_registration(self):
        serializer = RegisterationSerializer(data={
            "email": "user@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "password": "StrongPassword@1234",
            "confirm_password": "StrongPassword@1234"
        })

        self.assertTrue(serializer.is_valid(), serializer.errors) # if is_valid() retruns false - serializers.errors shows the error
        user = serializer.save()

        self.assertEqual(user.email, "user@example.com")
        self.assertTrue(user.check_password("StrongPassword@1234"))
        self.assertFalse(user.email_verified)

    def test_password_mismatch_fails(self):
        serializer = RegisterationSerializer(data={
            "email": "user@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "password": "StrongPassword@1234",
            "password": "SimplePassword@1234"
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn("confirm_password", serializer.errors)

    def test_weak_password_fails(self):
        serializer = RegisterationSerializer(data={
            "email": "user@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "password": "1234",
            "password": "1234"
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)

    
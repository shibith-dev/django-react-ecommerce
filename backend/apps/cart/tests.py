
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.catalog.models import Brand, Category, Product
from apps.cart.models import Cart, CartItem

User = get_user_model()


class CartAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="buyer@example.com", password="StrongPassword123!", email_verified=True)
        self.other_user = User.objects.create_user(email="other@example.com", password="StrongPassword123!", email_verified=True)

        self.brand = Brand.objects.create(name="Seiko", slug="seiko")
        self.category = Category.objects.create(name="Dive", slug="dive")
        self.product = Product.objects.create(brand=self.brand, category=self.category, name="Seiko Prospex", slug="seiko-prospex", sku="SEI-001", price=Decimal("25000.00"), stock=5)

        self.cart_url = reverse("cart")
        self.items_url = reverse("cart-items")

        self.client.force_authenticate(user=self.user)

    def test_cart_requires_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.cart_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_empty_cart(self):
        response = self.client.get(self.cart_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["item_count"], 0)
        self.assertEqual(Decimal(response.data["subtotal"]), Decimal("0.00"))

    def test_add_product_to_cart(self):
        response = self.client.post(
            self.items_url,
            {
                "product_id": self.product.id,
                "quantity": 2,
            }, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["item_count"], 2)
        self.assertEqual(Decimal(response.data["subtotal"]), Decimal("50000.00"))

    def test_adding_same_product_increases_quantity(self):
        self.client.post(self.items_url, {"product_id": self.product.id, "quantity": 1}, format="json")
        response = self.client.post(self.items_url, {"product_id": self.product.id, "quantity": 2}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CartItem.objects.count(), 1)
        self.assertEqual(CartItem.objects.get().quantity, 3)

    def test_cannot_add_more_than_available_stock(self):
        response = self.client.post(self.items_url, {"product_id": self.product.id, "quantity": 6}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(CartItem.objects.count(), 0)

    def test_inactive_product_cannot_be_added(self):
        self.product.is_active = False
        self.product.save(update_fields=["is_active"])
        response = self.client.post(self.items_url, {"product_id": self.product.id, "quantity": 1}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cart_only_contains_current_users_items(self):
        other_cart = Cart.objects.create(user=self.other_user)
        CartItem.objects.create(cart=other_cart, product=self.product, quantity=1)

        response = self.client.get(self.cart_url)

        self.assertEqual(response.data["item_count"], 0)

    def test_update_cart_quantity(self):
        self.client.post(self.items_url, {"product_id": self.product.id, "quantity": 1}, format="json")
        item = CartItem.objects.get(cart__user=self.user)

        response = self.client.patch(reverse("cart-item-detail", args=[item.id]), {"quantity": 3}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item.refresh_from_db()
        self.assertEqual(item.quantity, 3)

    def test_remove_cart_item(self):
        self.client.post(self.items_url, {"product_id": self.product.id, "quantity": 1}, format="json")
        item = CartItem.objects.get(cart__user=self.user)

        response = self.client.delete(reverse("cart-item-detail", args=[item.id]))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(CartItem.objects.filter(pk=item.id).exists())

    def test_cart_uses_current_product_price(self):
        self.client.post(self.items_url, {"product_id": self.product.id, "quantity": 2}, format="json")

        self.product.price = Decimal("30000.00")
        self.product.save(update_fields=["price", "updated_at"])

        response = self.client.get(self.cart_url)

        self.assertEqual(Decimal(response.data["subtotal"]), Decimal("60000.00"))
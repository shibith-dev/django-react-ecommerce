
from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.catalog.models import Brand, Category, Product


class CatalogAPITests(APITestCase):
    def setUp(self):
        self.brand = Brand.objects.create(name="Seiko", slug="seiko")
        self.category = Category.objects.create(name="Dive Watches", slug="dive")

        self.product = Product.objects.create(
            brand=self.brand,
            category=self.category,
            name="Seiko Prospex",
            slug="seiko-prospex",
            sku="SEI-001",
            description="Automatic dive watch",
            price=Decimal("25000.00"),
            stock=10,
            watch_type=Product.WatchType.ANALOG,
            movement_type=Product.MovementType.AUTOMATIC,
            strap_material=Product.StrapMaterial.STAINLESS_STEEL,
            dial_color=Product.Color.BLACK,
        )

        self.products_url = reverse("product-list")

    def test_products_are_public(self):
        response = self.client.get(self.products_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_filter_by_watch_type(self):
        response = self.client.get(self.products_url, {"watch_type": "analog"})
        self.assertEqual(response.data["count"], 1)

    def test_combined_filters(self):
        response = self.client.get(
            self.products_url,
            {
                "brand": "seiko",
                "watch_type": "analog",
                "movement_type": "automatic",
                "dial_color": "black",
                "min_price": "20000",
                "max_price": "30000",
            }
        )
        self.assertEqual(response.data["count"], 1)

    def test_invalid_price_range_returns_400(self):
        response = self.client.get(
            self.products_url,
            {
                "min_price": "30000",
                "max_price": "10000",
            }
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_watch_type_is_rejected(self):
        response = self.client.get(self.products_url, {"watch_type": "sample"})
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_inactive_product_is_hidden(self):
        self.product.is_active = False
        self.product.save(update_fields=["is_active"])

        response = self.client.get(self.products_url)
        self.assertEqual(response.data["count"], 0)

    def test_product_detail_uses_slug(self):
        response = self.client.get(
            reverse(
                "product-detail",
                kwargs={"slug": self.product.slug},
            )
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["movement_type"], "automatic")
        self.assertEqual(response.data["dial_color"], "black")

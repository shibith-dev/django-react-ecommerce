from django.db import models

# Create your models here.
from django.conf import settings
from django.core.validators import MinValueValidator

class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cart")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Cart for {self.user.email}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey('catalog.Product', on_delete=models.PROTECT, related_name="cart_items")
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields = ["cart", "product"], name = "unique_product_per_cart"),
            models.CheckConstraint(condition=models.Q(quantity__gte=1), name="cart_item_quantity_gte_1")
        ]

    def __str__(self):
        return f"{self.product.name} - {self.quantity}"

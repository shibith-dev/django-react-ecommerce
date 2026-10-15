from rest_framework import serializers

from apps.catalog.models import Product
from apps.catalog.serializers import ProductListSerializer

from .models import Cart, CartItem

from decimal import Decimal


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    unit_price = serializers.DecimalField(source="product.price", max_digits=10, decimal_places=2, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ("id", "product", "quantity", "unit_price", "total_price", "created_at", "updated_at")

    def get_total_price(self, obj):
        return obj.product.price * obj.quantity


class AddCartItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1)

    def validate_product_id(self, value):
        try:
            product = Product.objects.select_related("brand", "category").get(pk=value, is_active=True, brand__is_active=True, category__is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("This product is unavailable.")
        self.product = product
        return value

    def validate(self, data):
        product = self.product

        if product.stock < data["quantity"]:
            raise serializers.ValidationError({"quantity": "Requested quantity exceeds available stock."})
        
        return data


class UpdateCartItemSerialzier(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)

    def validate_quantity(self, value):
        item = self.context["cart_item"]

        if not item.product.is_active:
            raise serializers.ValidationError("This product is no longer available.")
        if value > item.product.stock:
            raise serializers.ValidationError("Requested quantity exceeds available stock.")
        return value



class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ("id", "items", "item_count", "subtotal", "created_at", "updated_at")

    def get_item_count(self, obj):
        return sum(item.quantity for item in obj.items.all())

    def get_subtotal(self, obj):
        subtotal = sum((item.product.price * item.quantity for item in obj.items.all()), Decimal("0.00"))
        return subtotal
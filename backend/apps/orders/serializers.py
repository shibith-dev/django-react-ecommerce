from rest_framework import serializers
from .models import Order, OrderItem

class ShippingSerializer(serializers.Serializer):
    shipping_name = serializers.CharField(max_length=150)
    shipping_email = serializers.EmailField()
    shipping_phone = serializers.CharField(max_length=30)
    shipping_address = serializers.CharField()

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "unit_price", "quantity", "subtotal"]
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["id", "status", "subtotal", "shipping_cost", "total", "shipping_name", "shipping_email", "shipping_phone", "shipping_address", "items", "created_at", "updated_at"]
        read_only_fields = fields
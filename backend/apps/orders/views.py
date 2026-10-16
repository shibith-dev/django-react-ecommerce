from django.shortcuts import render
from django.conf import settings
from django.db import transaction
from django.db.models import Prefetch

from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound

from apps.cart.models import Cart, CartItem
from apps.catalog.models import Product
from .models import Order, OrderItem
from .serializers import ShippingSerializer, OrderSerializer
from .tasks import send_order_confirmation_email

from decimal import Decimal

# Create your views here.

def get_order_queryset():
    return Order.objects.prefetch_related(Prefetch("items", queryset=OrderItem.objects.select_related("product")))

class OrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return get_order_queryset().filter(user=self.request.user)

    def create(self, request, *args, **kargs):
        shipping_serializer = ShippingSerializer(data=request.data)
        shipping_serializer.is_valid(raise_exception=True)
        shipping = shipping_serializer.validated_data

        with transaction.atomic():
            cart = Cart.objects.select_for_update().filter(user=request.user).first()
            if cart is None:
                raise ValidationError({"cart": "Your cart is empty"})

            cart_items = list(CartItem.objects.filter(cart=cart).select_related("product").order_by("product_id"))

            if not cart_items:
                raise ValidationError({"Cart": "Your cart is empty"})

            product_ids = [item.product_id for item in cart_items]

            products = list(Product.objects.select_for_update().filter(id__in=product_ids).order_by("id").select_related("brand", "category"))

            products_by_id = {product.id: product for product in products}

            subtotal = Decimal("0.00")

            order_lines = []

            for cart_item in cart_items:
                product = products_by_id.get(cart_item.product_id)

                if (product is None or not product.is_active or not product.brand.is_active or not product.category.is_active):
                    raise ValidationError({"cart": "A Product in your cart is no longer available. Please update your cart and try again."})

                if cart_item.quantity > product.stock:
                    raise ValidationError({"stock": f"Insufficient stock for {product.name}"})
                
                line_subtotal = product.price * cart_item.quantity
                subtotal += line_subtotal

                order_lines.append({
                    "product": product,
                    "product_name": product.name,
                    "unit_price": product.price,
                    "quantity": cart_item.quantity,
                    "subtotal": line_subtotal
                })

                shipping_cost = Decimal(str(settings.ORDER_SHIPPING_COST))

                if shipping_cost < 0:
                    raise ValidationError({"shipping": "Invalid shipping configuration."})

                order = Order.objects.create(
                    user=request.user,
                    subtotal=subtotal,
                    shipping_cost=shipping_cost,
                    total=subtotal + shipping_cost,
                    **shipping,
                )

                order_items = [OrderItem(order=order, **line) for line in order_lines]
                OrderItem.objects.bulk_create(order_items)

                for line in order_lines:
                    product = line["product"]
                    product.stock -= line["quantity"]
                    product.save(update_fields=["stock", "updated_at"])

                CartItem.objects.filter(cart=cart).delete()

                transaction.on_commit(lambda order_id=order.id: send_order_confirmation_email.delay(order_id))

        order = get_order_queryset().get(pk=order.pk)
        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = "order_id"

    def get_queryset(self):
        return get_order_queryset().filter(
            user=self.request.user
        )


class CancelOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        with transaction.atomic():
            order = Order.objects.select_for_update().filter(user=request.user, pk=order_id).first()

            if order is None:
                raise NotFound("Order not found.")

            if order.status not in {Order.Status.PLACED, Order.Status.PROCESSING}:
                raise ValidationError({"status": "This order can no longer be cancelled."})

            items = list(OrderItem.objects.filter(order=order).exclude(product__isnull=True).order_by("product_id"))

            product_ids = [item.product_id for item in items]

            products = {product.pk: product for product in Product.objects.select_for_update().filter(pk__in=product_ids).order_by("pk")}

            for item in items:
                product = products.get(item.product_id)

                if product is not None:
                    product.stock += item.quantity
                    product.save(update_fields=["stock", "updated_at"])

            order.status = Order.Status.CANCELLED
            order.save(update_fields=["status", "updated_at"])

        order = get_order_queryset().get(pk=order.pk)
        return Response(OrderSerializer(order).data)


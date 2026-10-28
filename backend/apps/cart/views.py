from django.db import transaction
from django.db.models import F, Prefetch

from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status

from apps.catalog.models import Product, ProductImage

from .models import CartItem, Cart
from .serializers import CartItemSerializer, AddCartItemSerializer, UpdateCartItemSerialzier, CartSerializer


def get_user_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart

def get_cart_queryset():
    return Cart.objects.prefetch_related(Prefetch("items", queryset=CartItem.objects.select_related("product", "product__brand", "product__category").prefetch_related("product__images")))

class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart, _ = get_cart_queryset().get_or_create(user=request.user)
        serializer = CartSerializer(cart, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class CartItemListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AddCartItemSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.product
        quantity = serializer.validated_data["quantity"]
        cart = get_user_cart(user=request.user)

        with transaction.atomic():
            product = Product.objects.select_for_update().select_related("category", "brand").get(id=product.id)
            
            if not product.is_active or not product.brand.is_active or not product.category.is_active:
                raise ValidationError("This product is unavailable")

            item, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={"quantity": quantity})

            if not created:
                new_quantity = item.quantity + quantity

                if new_quantity > product.stock:
                    raise ValidationError({"quantity": "Requested quantity exceeeds available stock."})
                
                item.quantity = new_quantity
                item.save(update_fields=["quantity", "updated_at"])

        cart = get_cart_queryset().get(id = cart.id)

        serializer = CartSerializer(cart, context={"request": request})

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, item_id):
        cart = get_user_cart(request.user)

        try:
            item = CartItem.objects.select_related("product").prefetch_related("product__images").get(pk=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response({"detail": "Cart item is not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = UpdateCartItemSerialzier(data=request.data, context={"cart_item": item})
        serializer.is_valid(raise_exception=True)

        item.quantity = serializer.validated_data["quantity"]
        item.save(update_fields=["quantity", "updated_at"])

        cart = get_cart_queryset().get(id=cart.id)

        serializer = CartSerializer(cart, context={"request": request})

        return Response(serializer.data)

    def delete(self, request, item_id):
        cart = get_user_cart(request.user)
        item = CartItem.objects.filter(id=item_id, cart=cart)
        if item is None:
            return Response({"detail": "Cart item is not found."})
        
        item.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)




            
            

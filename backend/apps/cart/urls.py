from django.urls import path
from .views import CartItemDetailView, CartItemListCreateView, CartView


urlpatterns = [
    path("", CartView.as_view(), name="cart"),
    path("items/", CartItemListCreateView.as_view(), name="cart-items"),
    path("items/<int:item_id>/", CartItemDetailView.as_view(), name="cart-item-detail")
]
from django.shortcuts import render
from django.db.models import Prefetch
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions
from rest_framework.exceptions import ValidationError

from .serializers import BrandSerializer, CategorySerializer, ProductListSerializer, ProductDetailSerializer
from .models import Brand, Category, Product, ProductImage
from .filters import ProductFilter
from .pagination import CatalogPagination

from decimal import Decimal


# Create your views here.

class BrandListView(generics.ListAPIView):
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Brand.objects.filter(is_active=True)


class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Category.objects.filter(is_active=True)


class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = CatalogPagination

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_class = ProductFilter

    search_fields = ["name", "description", "brand__name", "category__name", "sku"]

    ordering_fields = ["name", "price", "created_at", "case_diameter_mm"]


    def filter_queryset(self, queryset):
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")

        if min_price is not None and max_price is not None:
            try:
                lower = Decimal(min_price)
                upper = Decimal(max_price)
            except Exception:
                raise ValidationError({"price": "Price filters must be valid numbers."})

            if lower > upper:
                raise ValidationError({"price": "min_price cannot exceed max_price."})

        return super().filter_queryset(queryset)


    def get_queryset(self):
        return (
            Product.objects.filter(is_active=True, brand__is_active=True, category__is_active=True)
            .select_related("brand", "category")
            .prefetch_related("images")
        )

class ProductDetailView(generics.RetrieveAPIView):
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return (
           Product.objects.filter(is_active=True, brand__is_active=True, category__is_active=True)
           .select_related("brand", "category")
           .prefetch_related("images") 
        )
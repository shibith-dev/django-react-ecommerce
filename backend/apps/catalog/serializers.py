from rest_framework import serializers
from .models import Brand, Category, Product, ProductImage

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ("id", "name", "slug", "description", "logo")

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug")

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "is_primary")

class ProductListSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ("id", "name", "slug", "sku", "brand", "category", "price", "stock", "watch_type", "movement_type", "strap_color", "case_diameter_mm", "water_resistance_m", "primary_image")

    def get_primary_image(self, obj):
        # images are prefetched in primary-image first order.
        images = list(obj.images.all())
        image = images[0] if images else None

        if image is None:
            return None

        # Pass parent context so the nested serializer can access the HTTP 'request'. This ensures DRF builds absolute URLs (with domain/protocol) for images.
        return ProductImageSerializer(image, context=self.context).data

class ProductDetailSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only = True)
    category = CategorySerializer(read_only = True)
    images = ProductImageSerializer(many=True, read_only=True)
    class Meta:
        model = Product
        fields = ("id", "name", "slug", "sku", "description", "brand", "category", "price", "stock", "is_active", "watch_type", "movement_type", "strap_material", "dial_color", "dial_color", "case_color", "strap_color", "case_diameter_mm", "water_resistance_m", "images", "created_at", "updated_at")
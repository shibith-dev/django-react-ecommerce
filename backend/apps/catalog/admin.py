from django.contrib import admin
from .models import Brand, Category, Product, ProductImage

# Register your models here.

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}
        

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class OutOfStockFilter(admin.SimpleListFilter):
    title = 'stock availability'
    parameter_name = 'out_of_stock'

    def lookups(self, request, model_admin):
        return [('yes', 'Out of stock')]  # Just one simple option click

    def queryset(self, request, queryset):
        if self.value() == 'yes':
            return queryset.filter(stock__lte=0)
        return queryset

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "brand", "category", "watch_type", "movement_type", "price", "stock", "is_active")
    list_filter = (OutOfStockFilter, "is_active", "brand", "category", "watch_type", "movement_type", "strap_material", "dial_color")
    search_fields = ("name", "sku", "brand__name")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline]
    list_select_related = ("brand", "category")


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "is_primary", "created_at")
    list_filter = ("is_primary",)
    search_fields = ("product__name",)
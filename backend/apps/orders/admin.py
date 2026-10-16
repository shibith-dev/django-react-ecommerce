from django.contrib import admin

from .models import Order, OrderItem

# Register your models here.

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    can_delete = False
    readonly_fields = ("product", "product_name", "unit_price", "quantity", "subtotal")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "total", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("user__email", "shipping_name", "shipping_email")
    readonly_fields = ("user", "subtotal", "shipping_cost", "total", "shipping_name", "shipping_email", "shipping_phone", "shipping_address", "created_at", "updated_at")
    inlines = [OrderItemInline]


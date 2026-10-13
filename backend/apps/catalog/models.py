from django.db import models
from django.core.validators import MinValueValidator

# Create your models here.
class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    description=models.TextField(blank=True)
    logo = models.ImageField(upload_to="brands/", blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Product(models.Model):
    class WatchType(models.TextChoices):
        ANALOG = "analog", "Analog"
        DIGITAL = "digital", "Digital"
        SMARTWATCH = "smartwatch", "Smartwatch"
        HYBRID = "hybrid", "Hybrid"

    class MovementType(models.TextChoices):
        QUARTZ = "quartz", "Quartz"
        AUTOMATIC = "automatic", "Automatic"
        MECHANICAL = "mechanical", "Mechanical"
        SMART = "smart", "Smart"

    class StrapMaterial(models.TextChoices):
        STAINLESS_STEEL = "stainless_steel", "Stainless steel"
        LEATHER = "leather", "Leather"
        SILICONE = "silicone", "Silicone"
        RUBBER = "rubber", "Rubber"
        FABRIC = "fabric", "Fabric"
        TITANIUM = "titanium", "Titanium"
        RESIN = "resin", "Resin"
        OTHER = "other", "Other"

    class Color(models.TextChoices):
        BLACK = "black", "Black"
        WHITE = "white", "White"
        BLUE = "blue", "Blue"
        SILVER = "silver", "Silver"
        GOLD = "gold", "Gold"
        GREEN = "green", "Green"
        BROWN = "brown", "Brown"
        ROSE_GOLD = "rose_gold", "Rose gold"
        GREY = "grey", "Grey"
        OTHER = "other", "Other"
        
    brand = models.ForeignKey(Brand, on_delete=models.PROTECT, related_name="products")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    name = models.CharField(max_length=200)
    slug = models.CharField(max_length=220, unique=True)
    sku = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    watch_type = models.CharField(max_length=20, choices=WatchType.choices, default=WatchType.ANALOG)
    movement_type = models.CharField(max_length=20, choices=MovementType.choices, default=MovementType.QUARTZ)
    strap_material = models.CharField(max_length=30, choices=StrapMaterial.choices, default=StrapMaterial.OTHER)
    dial_color = models.CharField(max_length=20, choices=Color.choices, default=Color.OTHER)
    case_color = models.CharField(max_length=20, choices=Color.choices, default=Color.OTHER)
    strap_color = models.CharField(max_length=20, choices=Color.choices, default=Color.OTHER)
    case_diameter_mm = models.PositiveSmallIntegerField(null=True, blank=True)
    water_resistance_m = models.PositiveSmallIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["is_active", "created_at"]),
            models.Index(fields=["brand", "category"]),
            models.Index(fields=["watch_type", "movement_type"]),
            models.Index(fields=["price"])
        ]

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=150, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_primary", "id"] # primary images first then images oldest -> newest

    def __str__(self):
        return f"Image for {self.product.name}"
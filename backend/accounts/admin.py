from django.contrib import admin
from .models import User
from django.contrib.auth.admin import UserAdmin

# Register your models here.
@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    # Optional: Configure display options for your custom fields
    list_display = ('email', 'first_name', 'is_staff', 'is_active')
    ordering = ('email',)
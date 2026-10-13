import django_filters
from .models import Product

class ProductFilter(django_filters.FilterSet):
    brand = django_filters.CharFilter(field_name="brand__slug", lookup_expr="iexact")
    category = django_filters.CharFilter(field_name="category__slug", lookup_expr="iexact")
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    watch_type = django_filters.ChoiceFilter(choices=Product.WatchType.choices)
    movement_type = django_filters.ChoiceFilter(choices=Product.MovementType.choices)
    strap_material = django_filters.ChoiceFilter(choices=Product.StrapMaterial.choices)
    dial_color = django_filters.ChoiceFilter(choices=Product.Color.choices)
    case_color = django_filters.ChoiceFilter(choices=Product.Color.choices)
    strap_color = django_filters.ChoiceFilter(choices=Product.Color.choices)

    class Meta:
        model = Product
        fields = []
from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

from .models import Order

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_order_confirmation_email(self, order_id):
    try:
        order = Order.objects.prefetch_related("items").get(id=order_id)
        item_price_details = [f"{item.product_name} x {item.quantity}: {item.subtotal}" for item in order.items.all()]
        message = (
            f"Thank you for shopping with Chrono.\n\nOrder number: {order.id}\nStatus: {order.get_status_display()}\n\nItems:\n"
            + "\n".join(item_price_details)
            + f"\n\nSubtotal: {order.subtotal}"
            + f"\n\nShipping: {order.shipping_cost}"
            + f"\n\nTotal: {order.total}"
        )
        send_mail(
            subject=f"Chrono order confirmation #{order.id}",
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.shipping_email],
            fail_silently=False
        )
    except Exception as e:
        raise self.retry(exc = e)
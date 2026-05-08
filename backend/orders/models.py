from django.db      import models
from django.conf    import settings
from products.models import Product


class Order(models.Model):

    STATUS_CHOICES = [
        ("placed",           "Order Placed"),
        ("confirmed",        "Confirmed"),
        ("shipped",          "Shipped"),
        ("out_for_delivery", "Out for Delivery"),
        ("delivered",        "Delivered"),
        ("cancelled",        "Cancelled"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("pending",  "Pending"),
        ("paid",     "Paid"),
        ("refunded", "Refunded"),
    ]

    user           = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    # Shipping address snapshot
    full_name      = models.CharField(max_length=200)
    phone          = models.CharField(max_length=15)
    address        = models.TextField()
    city           = models.CharField(max_length=100)
    state          = models.CharField(max_length=100)
    pincode        = models.CharField(max_length=10)

    total_amount   = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, default="cod")   # always "cod" for now
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default="pending")

    status     = models.CharField(max_length=30, choices=STATUS_CHOICES, default="placed")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.id} by {self.user.email}"


class OrderItem(models.Model):
    order    = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product  = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    name     = models.CharField(max_length=200)   # price/name snapshot
    image    = models.CharField(max_length=500, blank=True)
    price    = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()

    @property
    def subtotal(self):
        return self.price * self.quantity

    def __str__(self):
        return f"{self.quantity}x {self.name} in Order #{self.order.id}"


class OrderStatusHistory(models.Model):
    order     = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="history")
    status    = models.CharField(max_length=30)
    note      = models.CharField(max_length=300, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]

    def __str__(self):
        return f"Order #{self.order.id} → {self.status}"

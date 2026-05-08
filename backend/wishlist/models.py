from django.db   import models
from django.conf import settings
from products.models import Product


class Wishlist(models.Model):
    user    = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wishlist"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="wishlisted_by"
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # unique_together ensures a user can't add the same
        # product twice — the DB enforces this at constraint level
        unique_together = ("user", "product")
        ordering        = ["-added_at"]   # newest first

    def __str__(self):
        return f"{self.user} → {self.product}"
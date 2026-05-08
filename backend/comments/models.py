from django.db import models

# Create your models here.
# backend/comments/models.py

# ─────────────────────────────────────────────────────────────────
# DESIGN DECISION — max 5 comments per product:
#
#   We don't enforce this in the model itself (that would be a
#   database constraint and hard to manage). Instead we enforce it
#   in the VIEW when a new comment is posted:
#     → count existing comments for this product
#     → if >= 5, delete the oldest one first
#     → then save the new one
#   This gives us a "sliding window" of the 5 most recent comments.
# ─────────────────────────────────────────────────────────────────

from django.db   import models
from django.conf import settings
from products.models import Product


class Comment(models.Model):
    product   = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,       # delete comments if product is deleted
        related_name="comments"
    )
    user      = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,       # delete comments if user is deleted
        related_name="comments"
    )
    text      = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)  # set once on creation

    class Meta:
        ordering = ["-created_at"]      # newest first

    def __str__(self):
        return f"{self.user} on {self.product}: {self.text[:40]}"
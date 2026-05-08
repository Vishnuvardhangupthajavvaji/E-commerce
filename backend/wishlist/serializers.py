from rest_framework import serializers
from .models        import Wishlist
from products.serializers import ProductSerializer


class WishlistSerializer(serializers.ModelSerializer):
    # Nest the full product data inside each wishlist entry
    # so the frontend gets everything it needs in one call
    product = ProductSerializer(read_only=True)

    class Meta:
        model  = Wishlist
        fields = ["id", "product", "added_at"]
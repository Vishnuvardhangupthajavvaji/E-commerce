
from rest_framework import serializers
from .models import Cart
from products.models import Product

class ProductMiniSerializer(serializers.ModelSerializer):
    
    product_picture = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "product_name", "product_picture", "price"]

    def get_product_picture(self, obj):
        request = self.context.get("request")
        if obj.product_picture:
            return request.build_absolute_uri(obj.product_picture.url)
        return None


class CartSerializer(serializers.ModelSerializer):
    
    product = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "product", "quantity", "total_price"]

    def get_product(self, obj):
        return ProductMiniSerializer(
            obj.product,
            context=self.context   # VERY IMPORTANT
        ).data

    def get_total_price(self, obj):
        return obj.quantity * obj.product.price

    

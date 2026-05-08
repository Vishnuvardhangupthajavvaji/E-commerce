from rest_framework import serializers
from .models import Product, ProductImage

    
class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model  = ProductImage
        fields = ["id", "image", "order"]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class ProductSerializer(serializers.ModelSerializer):

    product_picture = serializers.ImageField()
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "product_name", "product_picture",
            "price", "description", "color", "brand",
            "category", "stock", "images",
        ]

    def get_product_picture(self, obj):
        request = self.context.get("request")
        if obj.product_picture:
            return request.build_absolute_uri(obj.product_picture.url)
        return None
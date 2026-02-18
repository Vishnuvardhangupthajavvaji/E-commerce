from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):

    product_picture = serializers.ImageField()

    class Meta:
        model = Product
        fields = "__all__"

    def get_product_picture(self, obj):
        request = self.context.get("request")
        if obj.product_picture:
            return request.build_absolute_uri(obj.product_picture.url)
        return None
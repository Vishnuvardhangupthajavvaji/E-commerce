from rest_framework  import serializers
from .models         import Order, OrderItem, OrderStatusHistory


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model  = OrderItem
        fields = ["id", "name", "image", "price", "quantity", "subtotal"]


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = OrderStatusHistory
        fields = ["status", "note", "timestamp"]


class OrderSerializer(serializers.ModelSerializer):
    items   = OrderItemSerializer(many=True, read_only=True)
    history = OrderStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model  = Order
        fields = [
            "id", "full_name", "phone", "address", "city", "state", "pincode",
            "total_amount", "payment_method", "payment_status",
            "status", "created_at", "updated_at",
            "items", "history",
        ]

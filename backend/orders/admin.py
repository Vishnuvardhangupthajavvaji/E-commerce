from django.contrib import admin
from .models import Order, OrderItem, OrderStatusHistory


class OrderItemInline(admin.TabularInline):
    model           = OrderItem
    extra           = 0
    readonly_fields = ["name", "image", "price", "quantity"]


class OrderStatusHistoryInline(admin.TabularInline):
    model           = OrderStatusHistory
    extra           = 0
    readonly_fields = ["status", "note", "timestamp"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display    = ["id", "user", "status", "payment_status", "total_amount", "created_at"]
    list_filter     = ["status", "payment_status"]
    search_fields   = ["user__email", "full_name", "phone"]
    readonly_fields = ["created_at", "updated_at"]
    inlines         = [OrderItemInline, OrderStatusHistoryInline]
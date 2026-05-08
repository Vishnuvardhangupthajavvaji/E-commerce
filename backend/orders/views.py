from rest_framework.views       import APIView
from rest_framework.response    import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.conf                import settings
from django.core.mail           import EmailMessage

from .models      import Order, OrderItem, OrderStatusHistory
from .serializers import OrderSerializer
from cart.models  import Cart
from products.models import Product


# ── Email helper ───────────────────────────────────────────────────

def send_order_confirmation(order):
    items_text = "\n".join(
        f"  {item.name} x{item.quantity}  Rs.{item.price * item.quantity}"
        for item in order.items.all()
    )
    body = (
        f"Hi {order.full_name},\n\n"
        f"Your order #{order.id} has been placed successfully!\n\n"
        f"Items:\n{items_text}\n\n"
        f"Total: Rs.{order.total_amount}\n"
        f"Payment: Cash on Delivery\n\n"
        f"Shipping to:\n"
        f"{order.address}, {order.city}, {order.state} - {order.pincode}\n\n"
        f"Track your order at:\n"
        f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/orders/{order.id}\n\n"
        f"Thank you for shopping with JVVG Store!\n"
        f"-- JVVG Store Team"
    )
    try:
        msg = EmailMessage(
            subject=f"Order #{order.id} Confirmed - JVVG Store",
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[order.user.email],
        )
        msg.encoding = "ascii"
        msg.send(fail_silently=True)
    except Exception as e:
        print(f"Order email failed: {e}")


# ── Place Order (COD only) ─────────────────────────────────────────

class PlaceOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data

        # Validate address fields
        required = ["full_name", "phone", "address", "city", "state", "pincode"]
        for field in required:
            if not str(data.get(field, "")).strip():
                return Response({"error": f"{field} is required."}, status=400)

        # ── Determine items source ──────────────────────────────────
        buy_now_items = data.get("items")   # frontend sends items[] in buy now mode

        if buy_now_items:
            # BUY NOW — items array sent directly from frontend
            items = []
            total = 0

            for entry in buy_now_items:
                try:
                    product = Product.objects.get(pk=entry["product_id"])
                except Product.DoesNotExist:
                    return Response({"error": f"Product {entry['product_id']} not found."}, status=404)

                quantity = int(entry.get("quantity", 1))
                if quantity < 1:
                    return Response({"error": "Quantity must be at least 1."}, status=400)
                if quantity > product.stock:
                    return Response({"error": f"Not enough stock for {product.product_name}."}, status=400)

                items.append({"product": product, "quantity": quantity})
                total += product.price * quantity

        else:
            # CART CHECKOUT — read from cart
            cart_items = Cart.objects.filter(user=user).select_related("product")
            if not cart_items.exists():
                return Response({"error": "Your cart is empty."}, status=400)

            items = [{"product": i.product, "quantity": i.quantity} for i in cart_items]
            total = sum(i["product"].price * i["quantity"] for i in items)

        # ── Create order ────────────────────────────────────────────
        order = Order.objects.create(
            user           = user,
            full_name      = data["full_name"].strip(),
            phone          = data["phone"].strip(),
            address        = data["address"].strip(),
            city           = data["city"].strip(),
            state          = data["state"].strip(),
            pincode        = data["pincode"].strip(),
            total_amount   = total,
            payment_method = "cod",
            payment_status = "pending",
            status         = "placed",
        )

        # ── Create order items ──────────────────────────────────────
        for item in items:
            p = item["product"]
            OrderItem.objects.create(
                order    = order,
                product  = p,
                name     = p.product_name,
                image    = request.build_absolute_uri(p.product_picture.url) if p.product_picture else "",
                price    = p.price,
                quantity = item["quantity"],
            )

        # ── Status history ──────────────────────────────────────────
        OrderStatusHistory.objects.create(
            order=order, status="placed",
            note="Order placed successfully."
        )

        # ── Clear cart ONLY for cart checkout ───────────────────────
        if not buy_now_items:
            Cart.objects.filter(user=user).delete()

        send_order_confirmation(order)

        return Response({
            "order":   OrderSerializer(order).data,
            "message": "Order placed successfully!",
        }, status=201)

# ── My Orders ─────────────────────────────────────────────────────

class MyOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related("items", "history")
        return Response(OrderSerializer(orders, many=True).data)


# ── Single Order Detail ───────────────────────────────────────────

class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            order = Order.objects.prefetch_related("items", "history").get(
                pk=pk, user=request.user
            )
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=404)
        return Response(OrderSerializer(order).data)


# ── Cancel Order ─────────────────────────────────────────────────

class CancelOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=404)

        if order.status in ("delivered", "cancelled"):
            return Response(
                {"error": f"Cannot cancel an order that is already {order.status}."},
                status=400
            )

        order.status = "cancelled"
        order.save()
        OrderStatusHistory.objects.create(
            order=order, status="cancelled",
            note="Cancelled by customer."
        )
        return Response({"message": "Order cancelled."})


# ── Admin: All Orders ─────────────────────────────────────────────

class AdminOrderListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        orders = Order.objects.all().prefetch_related("items", "history").select_related("user")
        status_filter = request.query_params.get("status")
        if status_filter:
            orders = orders.filter(status=status_filter)
        return Response(OrderSerializer(orders, many=True).data)


# ── Admin: Update Order Status ────────────────────────────────────

class AdminUpdateOrderStatusView(APIView):
    permission_classes = [IsAdminUser]

    VALID_STATUSES = ["placed", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled"]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=404)

        new_status = request.data.get("status", "").strip()
        note       = request.data.get("note", "").strip()

        if new_status not in self.VALID_STATUSES:
            return Response(
                {"error": f"Invalid status. Choose from: {self.VALID_STATUSES}"},
                status=400
            )

        order.status = new_status
        order.save()
        OrderStatusHistory.objects.create(order=order, status=new_status, note=note)

        return Response(OrderSerializer(order).data)
from django.shortcuts import render

# Create your views here.


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Cart
from .serializers import CartSerializer


class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")
        quantity   = request.data.get("quantity", 1)

        cart_item, created = Cart.objects.get_or_create(
            user=request.user,
            product_id=product_id,
            defaults={"quantity": int(quantity)}   # applied only when creating
        )
        if not created:
            cart_item.quantity += int(quantity)
            cart_item.save()

        return Response({"message": "Added to cart"})

# class CartListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         items = Cart.objects.filter(user=request.user)
#         for item in items :
#             print(item, item.product.product_picture)
#         serializer = CartSerializer(items, many=True)
#         return Response(serializer.data)

class CartListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = Cart.objects.filter(user=request.user)

        serializer = CartSerializer(
            items,
            many=True,
            context={'request': request}   # IMPORTANT
        )

        return Response(serializer.data)



class UpdateCartView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        quantity = request.data.get("quantity")
        cart_item = Cart.objects.get(id=pk, user=request.user)
        cart_item.quantity = quantity
        cart_item.save()
        return Response({"message": "Quantity updated"})


class RemoveCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        Cart.objects.filter(id=pk, user=request.user).delete()
        return Response({"message": "Removed"})

class BulkDeleteCartView(APIView):
    """
    DELETE /api/cart/bulk-delete/
    Body: { "ids": [1, 2, 5] }

    WHY a dedicated API instead of looping single deletes:
      • 1 network round-trip instead of N
      • 1 database query instead of N  (filter + delete in one shot)
      • Atomic — either all delete or none (no partial failures)
      • Safer — we filter by user so users can't delete others' items
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        ids = request.data.get("ids", [])

        if not ids:
            return Response(
                {"error": "No ids provided"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # filter(user=request.user) ensures users can only
        # delete their OWN cart items — security guard
        deleted_count, _ = Cart.objects.filter(
            id__in=ids,
            user=request.user
        ).delete()

        return Response({"message": f"{deleted_count} items removed"})


# ── NEW: Clear entire cart ────────────────────────────────────────
class ClearCartView(APIView):
    """
    DELETE /api/cart/clear/
    Removes ALL items from the current user's cart.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        Cart.objects.filter(user=request.user).delete()
        return Response({"message": "Cart cleared"})
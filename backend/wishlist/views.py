
from rest_framework.views       import APIView
from rest_framework.response    import Response
from rest_framework             import status
from rest_framework.permissions import IsAuthenticated

from .models      import Wishlist
from products.models import Product
from .serializers import WishlistSerializer


class WishlistListView(APIView):
    """
    GET /api/wishlist/
    Returns all wishlist items for the current user,
    with full product details nested inside.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items      = Wishlist.objects.filter(user=request.user)
        serializer = WishlistSerializer(
            items, many=True,
            context={"request": request}   # needed for absolute image URLs
        )
        return Response(serializer.data)


# class WishlistToggleView(APIView):
#     """
#     POST /api/wishlist/toggle/
#     Body: { "product_id": 5 }

#     TOGGLE PATTERN:
#       If product is NOT in wishlist → add it  → return {"action": "added"}
#       If product IS in wishlist     → remove it → return {"action": "removed"}

#     This single endpoint replaces separate add/remove endpoints.
#     The frontend just calls toggle and reads the response action.
#     """
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         product_id = request.data.get("product_id")

#         if not product_id:
#             return Response(
#                 {"error": "product_id required"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # get_or_create returns (instance, created_boolean)
#         # If it was just created → "added"
#         # If it already existed → delete it → "removed"
#         item, created = Wishlist.objects.get_or_create(
#             user=request.user,
#             product_id=product_id
#         )

#         if created:
#             return Response({"action": "added",   "product_id": product_id})
#         else:
#             item.delete()
#             return Response({"action": "removed", "product_id": product_id})

class WishlistToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")
        if not product_id:
            return Response({"error": "product_id required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        item = Wishlist.objects.filter(user=request.user, product=product).first()

        if item:
            item.delete()
            return Response({"wishlisted": False})   # ← must be "wishlisted", not "action"
        else:
            Wishlist.objects.create(user=request.user, product=product)
            return Response({"wishlisted": True}, status=status.HTTP_201_CREATED)


class WishlistProductIdsView(APIView):
    """
    GET /api/wishlist/ids/
    Returns just the list of product IDs in the user's wishlist.
    Used by the frontend to know which heart icons to fill in
    without fetching full product data.
    e.g. [3, 7, 12]
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ids = Wishlist.objects.filter(
            user=request.user
        ).values_list("product_id", flat=True)
        return Response(list(ids))
    

class WishlistCheckView(APIView):
    """
    GET /api/wishlist/check/<product_id>/
    Returns { wishlisted: true/false } for a single product.
    Used by ProductDetail to know whether to show a filled or empty heart.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        exists = Wishlist.objects.filter(user=request.user, product_id=product_id).exists()
        return Response({"wishlisted": exists})
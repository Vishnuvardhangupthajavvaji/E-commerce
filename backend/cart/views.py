from django.shortcuts import render

# Create your views here.


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Cart
from .serializers import CartSerializer


class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")
        quantity = request.data.get("quantity", 1)

        cart_item, created = Cart.objects.get_or_create(
            user=request.user,
            product_id=product_id
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


from rest_framework.views       import APIView
from rest_framework.response    import Response
from rest_framework             import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models      import Comment
from .serializers import CommentSerializer


class CommentListView(APIView):
    """
    GET /api/comments/?product=<id>
    Returns all comments for a specific product.
    Anyone can read comments (AllowAny).
    """
    permission_classes = [AllowAny]

    def get(self, request):
        product_id = request.query_params.get("product")

        if not product_id:
            return Response(
                {"error": "product query param required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        comments = Comment.objects.filter(product_id=product_id)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)


class CommentCreateView(APIView):
    """
    POST /api/comments/add/
    Body: { product: <id>, text: "..." }

    Only logged-in users can post (IsAuthenticated).

    SLIDING WINDOW LOGIC:
      If this product already has 5 comments, we delete the
      oldest one before saving the new one. This keeps the
      comment count at exactly 5 per product at all times.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product")

        # Count existing comments for this product
        existing = Comment.objects.filter(product_id=product_id)
        count     = existing.count()

        # If at the limit, remove the oldest (last in "-created_at" ordering)
        MAX_COMMENTS = 5
        if count >= MAX_COMMENTS:
            oldest = existing.last()   # last because ordering is "-created_at"
            if oldest:
                oldest.delete()

        # Now create the new comment
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)   # attach logged-in user
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentDeleteView(APIView):
    """
    DELETE /api/comments/<id>/
    Users can only delete their own comments.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            comment = Comment.objects.get(id=pk, user=request.user)
        except Comment.DoesNotExist:
            return Response(
                {"error": "Not found or not yours"},
                status=status.HTTP_404_NOT_FOUND
            )
        comment.delete()
        return Response({"message": "Deleted"}, status=status.HTTP_204_NO_CONTENT)
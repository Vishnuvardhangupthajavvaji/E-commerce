# backend/comments/serializers.py

from rest_framework import serializers
from .models import Comment


class CommentSerializer(serializers.ModelSerializer):

    # Read the username from the related User object
    # source="user.username" follows the FK relationship
    username = serializers.CharField(source="user.username", read_only=True)

    # Format the date nicely for the frontend
    created_at = serializers.DateTimeField(
        format="%d %b %Y, %I:%M %p",   # e.g. "19 Feb 2026, 03:45 PM"
        read_only=True
    )

    class Meta:
        model  = Comment
        fields = ["id", "username", "text", "created_at", "product", "user"]
        # product and user are write-only (frontend sends them, we don't expose IDs back)
        extra_kwargs = {
            "product": {"write_only": True},
            "user":    {"read_only": True},   # set from request.user in the view
        }
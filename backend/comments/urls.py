# backend/comments/urls.py

from django.urls import path
from .views import CommentListView, CommentCreateView, CommentDeleteView

urlpatterns = [
    path("",           CommentListView.as_view()),    # GET  /api/comments/?product=<id>
    path("add/",       CommentCreateView.as_view()),  # POST /api/comments/add/
    path("<int:pk>/",  CommentDeleteView.as_view()),  # DELETE /api/comments/<id>/
]
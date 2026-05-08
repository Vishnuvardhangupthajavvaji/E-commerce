from django.urls import path
from .views import WishlistListView, WishlistToggleView, WishlistProductIdsView, WishlistCheckView

urlpatterns = [
    path("",        WishlistListView.as_view()),       # GET  /api/wishlist/
    path("toggle/", WishlistToggleView.as_view()),     # POST /api/wishlist/toggle/
    path("ids/",    WishlistProductIdsView.as_view()), # GET  /api/wishlist/ids/
    path("check/<int:product_id>/", WishlistCheckView.as_view()), 
]
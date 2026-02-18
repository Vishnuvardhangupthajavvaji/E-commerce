from django.urls import path
from .views import AddToCartView, CartListView, RemoveCartItemView, UpdateCartView

urlpatterns = [
    path("", CartListView.as_view()),
    path("add/", AddToCartView.as_view()),
    path("remove/<int:pk>/", RemoveCartItemView.as_view()),
    path("update/<int:pk>/", UpdateCartView.as_view()),

]

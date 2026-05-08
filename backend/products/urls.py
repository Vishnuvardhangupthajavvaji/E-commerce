from django.urls import path
from .views import ProductListView, ProductCreateView, ProductDetailView, FeaturedProductsView, ProductUpdateView, ProductDeleteView, ProductImageDeleteView

urlpatterns = [
    path("", ProductListView.as_view()),
    path("create/", ProductCreateView.as_view()),
    path("update/<int:pk>/", ProductUpdateView.as_view()),
    path("<int:pk>/", ProductDetailView.as_view()),
    path('featured/', FeaturedProductsView.as_view()),
    path("delete/<int:pk>/", ProductDeleteView.as_view()),
    path("images/<int:pk>/",  ProductImageDeleteView.as_view()),

]

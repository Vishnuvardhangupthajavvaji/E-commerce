from django.shortcuts import render

# Create your views here.

from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveAPIView, UpdateAPIView, RetrieveUpdateAPIView, DestroyAPIView
from .models import Product
from .serializers import ProductSerializer
from django.db.models import Q
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.parsers import FormParser, MultiPartParser

class ProductListView(ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Product.objects.all()
        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(
                Q(product_name__icontains=search) |
                Q(category__icontains=search) |
                Q(brand__icontains=search)
            )

        return queryset



class ProductCreateView(CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [FormParser, MultiPartParser]

class ProductUpdateView(RetrieveUpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'pk'
    parser_classes = [FormParser, MultiPartParser]

class ProductDetailView(RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


class FeaturedProductsView(ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Product.objects.all()[:3]
    

class ProductDeleteView(DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]
    lookup_field = "pk"

from django.shortcuts import render

# Create your views here.

from rest_framework.generics import ListAPIView, RetrieveAPIView, RetrieveUpdateAPIView, DestroyAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Product, ProductImage
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
        category = self.request.query_params.get("category")

        if search:
            queryset = queryset.filter(
                Q(product_name__icontains=search) |
                Q(category__icontains=search) |
                Q(brand__icontains=search)
            )
        if category:
            queryset = queryset.filter(category__iexact=category)

        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context



class ProductCreateView(APIView):
    
    permission_classes = [IsAdminUser]
    parser_classes = [FormParser, MultiPartParser]

    def post(self, request):
        serializer = ProductSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            product = serializer.save()
            extra_images = request.FILES.getlist("product_images")
            for idx, img_file in enumerate(extra_images):
                ProductImage.objects.create(product=product, image=img_file, order=idx)
            return Response(
                ProductSerializer(product, context={"request": request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductUpdateView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes     = [FormParser, MultiPartParser]

    def patch(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductSerializer(
            product, data=request.data, partial=True,
            context={"request": request}
        )
        if serializer.is_valid():
            product = serializer.save()

            if "existing_image_ids" in request.data:
                raw      = request.data["existing_image_ids"]
                keep_ids = [int(x) for x in raw.split(",") if x.strip().isdigit()]
                product.images.exclude(id__in=keep_ids).delete()

            for idx, img_file in enumerate(request.FILES.getlist("product_images")):
                ProductImage.objects.create(
                    product=product,
                    image=img_file,
                    order=product.images.count()
                )

            return Response(ProductSerializer(product, context={"request": request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductDetailView(RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class FeaturedProductsView(ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Product.objects.all()[:6]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    

class ProductDeleteView(DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]
    lookup_field = "pk"


class ProductImageDeleteView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, pk):
        try:
            ProductImage.objects.get(pk=pk).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProductImage.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
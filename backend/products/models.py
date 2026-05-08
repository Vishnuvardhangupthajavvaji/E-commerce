from django.db import models

# Create your models here.

class Product(models.Model):
    product_name = models.CharField(max_length=100)
    product_picture = models.ImageField(upload_to="products/")
    price = models.FloatField()
    description = models.CharField(max_length=2000, blank=True, null=True)
    color = models.CharField(max_length=15, blank=True, null=True)
    brand = models.CharField(max_length=100, blank=True, null=True)
    category = models.CharField(max_length=100)
    stock = models.PositiveIntegerField(default=0)


    def __str__(self):
        return self.product_name


class ProductImage(models.Model):
    """
    Stores additional images for a product.
    'order' controls the display sequence (0 = first shown in gallery).

    WHY a separate table instead of storing in Product?
      • A product can have 1, 3, or 10 images — unknown count at design time
      • You can't store N images in a fixed number of columns
      • Separate table = clean, scalable, each row is one image
      • Django can efficiently query: product.images.all()
    """
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,   # delete all images when product is deleted
        related_name="images"       # lets us do product.images.all()
    )
    image   = models.ImageField(upload_to="products/gallery/")
    order   = models.PositiveIntegerField(default=0)  # display order

    class Meta:
        ordering = ["order"]   # always return in display order

    def __str__(self):
        return f"{self.product.product_name} — image {self.order}"

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

    def __str__(self):
        return self.product_name

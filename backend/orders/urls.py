from django.urls import path
from .views import (
    PlaceOrderView,
    MyOrdersView, OrderDetailView, CancelOrderView,
    AdminOrderListView, AdminUpdateOrderStatusView,
)

urlpatterns = [
    path("place/",                 PlaceOrderView.as_view()),
    path("my/",                    MyOrdersView.as_view()),
    path("<int:pk>/",              OrderDetailView.as_view()),
    path("<int:pk>/cancel/",       CancelOrderView.as_view()),
    path("admin/",                 AdminOrderListView.as_view()),
    path("admin/<int:pk>/status/", AdminUpdateOrderStatusView.as_view()),
]
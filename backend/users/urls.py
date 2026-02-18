from django.urls import path
from .views import RegisterView, UserProfileView, UpdateProfileView, ChangePasswordView

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("me/", UserProfileView.as_view()),
    path("me/update", UpdateProfileView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),
]

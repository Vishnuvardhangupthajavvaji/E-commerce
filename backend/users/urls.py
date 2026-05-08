from django.urls import path
from .views import (
    RegisterView, UserProfileView, UpdateProfileView,
    ChangePasswordView, ForgotPasswordView,
    AdminUserListView, AdminToggleStaffView, AdminStatsView,
    ForgotPasswordView, ResetPasswordView
)
urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("me/", UserProfileView.as_view()),
    path("me/update", UpdateProfileView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),
    path("forgot-password/", ForgotPasswordView.as_view()),
    path("reset-password/<str:token>/", ResetPasswordView.as_view()),

    # ADMIN-only

    path("admin/users/", AdminUserListView.as_view()),
    path("admin/users/<int:pk>/toggle-staff/", AdminToggleStaffView.as_view()),
    path("admin/stats/", AdminStatsView.as_view()),
]

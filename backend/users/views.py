# backend/users/views.py

from rest_framework.views        import APIView
from rest_framework.response     import Response
from rest_framework              import status
from rest_framework.permissions  import IsAuthenticated, IsAdminUser
from django.contrib.auth.hashers import make_password
from django.contrib.auth.tokens  import default_token_generator
from django.core.mail            import EmailMessage
from django.conf                 import settings

from .serializers import RegisterSerializer, ChangePasswordSerializer, AdminUserSerializer
from .models      import User, PasswordResetToken

from django.db.models import Sum, Count
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response(RegisterSerializer(request.user).data)


class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request):
        serializer = RegisterSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated", "data": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            request.user.password = make_password(serializer.validated_data["new_password"])
            request.user.save()
            return Response({"message": "Password changed successfully"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class ForgotPasswordView(APIView):
    """
    POST /api/users/forgot-password/
    Body: { "email": "user@example.com" }

    ALWAYS returns 200 with the same message whether the email
    exists or not. This prevents attackers from discovering which
    emails are registered (email enumeration attack).

    If the email exists:
      1. Create a PasswordResetToken for that user
      2. Send an email with the reset link
    """
    def post(self, request):
        email = request.data.get("email", "").strip().lower()

        # Generic response — never reveal if email exists
        GENERIC_RESPONSE = Response({
            "message": "If this email is registered, a reset link has been sent."
        })

        if not email:
            return GENERIC_RESPONSE

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return GENERIC_RESPONSE

        # Create token (deletes any previous token for this user)
        reset_token = PasswordResetToken.create_for_user(user)

        # The link the user will click in their email
        # FRONTEND_URL should be set in settings.py (see FILE 4)
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
        reset_link   = f"{frontend_url}/reset-password/{reset_token.token}"

        # Send the email using EmailMessage so we can force 7bit encoding.
        # send_mail() uses quoted-printable (Content-Transfer-Encoding: qp)
        # which breaks long URLs across lines with "=\n" soft line breaks.
        # 7bit encoding never wraps lines, so the reset link stays intact.
        try:
            body = (
                f"Hi {user.first_name or user.username},\n\n"
                f"You requested a password reset for your JVVG Store account.\n\n"
                f"Click the link below to set a new password (valid for 1 hour):\n\n"
                f"{reset_link}\n\n"
                f"If you did not request this, you can safely ignore this email.\n"
                f"Your password will not change.\n\n"
                f"-- JVVG Store Team"
            )
            email_msg = EmailMessage(
                subject="Reset your JVVG Store password",
                body=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
            )
            # ascii encoding forces 7bit transfer encoding — no quoted-printable,
            # no line wrapping, reset link prints cleanly in one piece.
            email_msg.encoding = "ascii"
            email_msg.send(fail_silently=False)
        except Exception as e:
            print(f"Email send failed: {e}")

        return GENERIC_RESPONSE


class ResetPasswordView(APIView):
    """
    POST /api/users/reset-password/<token>/
    Body: { "new_password": "newpass123" }

    Validates the token, sets the new password, deletes the token.
    """
    def post(self, request, token):
        # Strip whitespace — guards against copied tokens with trailing newline
        token        = token.strip()
        new_password = request.data.get("new_password", "").strip()

        if len(new_password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Debug: print all tokens in DB so you can compare in the console
        all_tokens = list(PasswordResetToken.objects.values_list("token", flat=True))
        print(f"[ResetPassword] received token : '{token}'")
        print(f"[ResetPassword] tokens in DB   : {all_tokens}")

        try:
            reset_obj = PasswordResetToken.objects.select_related("user").get(token=token)
        except PasswordResetToken.DoesNotExist:
            return Response(
                {"error": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not reset_obj.is_valid():
            reset_obj.delete()
            return Response(
                {"error": "This reset link has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = reset_obj.user
        user.password = make_password(new_password)
        user.save()
        reset_obj.delete()

        return Response({"message": "Password reset successfully. You can now log in."})


# ── Admin-only views ────────────────────────────────────────────

class AdminUserListView(APIView):
    """
    GET /api/users/admin/users/
    Returns all users. Admin only.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by("-date_joined")
        serializer = AdminUserSerializer(users, many=True)
        return Response(serializer.data)


class AdminToggleStaffView(APIView):
    """
    PATCH /api/users/admin/users/<id>/toggle-staff/
    Toggles is_staff on a user. Admin only.
    Cannot demote yourself.
    """
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        if pk == request.user.pk:
            return Response(
                {"error": "You cannot change your own admin status."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            user = User.objects.get(pk=pk)
            user.is_staff = not user.is_staff
            user.save()
            return Response({
                "message": f"{'Granted' if user.is_staff else 'Revoked'} admin for {user.username}",
                "is_staff": user.is_staff
            })
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


class AdminStatsView(APIView):
    """
    GET /api/users/admin/stats/
    Returns all dashboard stats including multi-period revenue data.
    Safe — returns zeros if orders app not installed yet.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        from products.models import Product
        from cart.models     import Cart

        # ── Product stats ──────────────────────────────────────
        products        = Product.objects.all()
        total_products  = products.count()
        low_stock       = products.filter(stock__gt=0, stock__lt=5).count()
        out_of_stock    = products.filter(stock=0).count()
        categories      = (
            products.values("category")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        # ── User & Cart stats ──────────────────────────────────
        total_users      = User.objects.count()
        total_cart_items = Cart.objects.aggregate(total=Sum("quantity"))["total"] or 0

        # ── Order stats ────────────────────────────────────────
        total_orders   = 0
        total_revenue  = 0
        pending_orders = 0
        orders_today   = 0
        recent_orders  = []

        # Revenue graphs for all periods
        # Each is a list of {date/label, revenue, orders}
        revenue_daily     = []   # last 7 days
        revenue_weekly    = []   # last 8 weeks
        revenue_monthly   = []   # last 12 months
        revenue_quarterly = []   # last 6 quarters
        revenue_yearly    = []   # last 5 years

        try:
            from orders.models import Order
            from django.utils  import timezone
            from datetime      import timedelta
            from django.db.models.functions import TruncYear, TruncMonth, TruncWeek, TruncDate

            qs = Order.objects.all()

            total_orders   = qs.count()
            pending_orders = qs.filter(
                status__in=["placed", "confirmed", "shipped", "out_for_delivery"]
            ).count()

            # For COD, revenue = total of DELIVERED orders
            # (payment happens on delivery, status "paid" never gets set for COD)
            delivered_qs   = qs.filter(status="delivered")
            total_revenue  = delivered_qs.aggregate(
                total=Sum("total_amount")
            )["total"] or 0

            today        = timezone.now().date()
            orders_today = qs.filter(created_at__date=today).count()

            # Last 5 recent orders
            recent_orders = list(
                qs.select_related("user")
                .order_by("-created_at")[:5]
                .values("id", "full_name", "total_amount",
                        "status", "payment_method", "created_at")
            )
            for o in recent_orders:
                o["created_at"] = o["created_at"].isoformat()

            now = timezone.now()

            # ── Daily: last 7 days ─────────────────────────────
            seven_ago = now - timedelta(days=6)
            daily_raw = (
                delivered_qs.filter(created_at__gte=seven_ago)
                .annotate(period=TruncDate("created_at"))
                .values("period")
                .annotate(revenue=Sum("total_amount"), orders=Count("id"))
                .order_by("period")
            )
            # Fill in missing days with 0
            daily_map = {str(r["period"]): r for r in daily_raw}
            for i in range(7):
                d = (now - timedelta(days=6-i)).date()
                ds = str(d)
                revenue_daily.append({
                    "label":   d.strftime("%d %b"),
                    "date":    ds,
                    "revenue": float(daily_map[ds]["revenue"]) if ds in daily_map else 0,
                    "orders":  daily_map[ds]["orders"] if ds in daily_map else 0,
                })

            # ── Weekly: last 8 weeks ───────────────────────────
            eight_weeks_ago = now - timedelta(weeks=7)
            weekly_raw = (
                delivered_qs.filter(created_at__gte=eight_weeks_ago)
                .annotate(period=TruncWeek("created_at"))
                .values("period")
                .annotate(revenue=Sum("total_amount"), orders=Count("id"))
                .order_by("period")
            )
            week_map = {str(r["period"].date()): r for r in weekly_raw}
            for i in range(8):
                week_start = (now - timedelta(weeks=7-i)).date()
                # round to Monday
                week_start = week_start - timedelta(days=week_start.weekday())
                ws = str(week_start)
                revenue_weekly.append({
                    "label":   f"W{week_start.strftime('%d %b')}",
                    "date":    ws,
                    "revenue": float(week_map[ws]["revenue"]) if ws in week_map else 0,
                    "orders":  week_map[ws]["orders"] if ws in week_map else 0,
                })

            # ── Monthly: last 12 months ────────────────────────
            twelve_ago = now - timedelta(days=365)
            monthly_raw = (
                delivered_qs.filter(created_at__gte=twelve_ago)
                .annotate(period=TruncMonth("created_at"))
                .values("period")
                .annotate(revenue=Sum("total_amount"), orders=Count("id"))
                .order_by("period")
            )
            month_map = {str(r["period"].date()): r for r in monthly_raw}
            from dateutil.relativedelta import relativedelta
            for i in range(12):
                m = (now - relativedelta(months=11-i)).replace(day=1).date()
                ms = str(m)
                revenue_monthly.append({
                    "label":   m.strftime("%b %Y"),
                    "date":    ms,
                    "revenue": float(month_map[ms]["revenue"]) if ms in month_map else 0,
                    "orders":  month_map[ms]["orders"] if ms in month_map else 0,
                })

            # ── Quarterly: last 6 quarters ─────────────────────
            for i in range(6):
                q_offset  = 5 - i
                q_month   = ((now.month - 1 - q_offset * 3) % 12) + 1
                q_year    = now.year + ((now.month - 1 - q_offset * 3) // 12)
                q_start_m = ((q_month - 1) // 3) * 3 + 1
                from datetime import date
                q_start   = date(q_year, q_start_m, 1)
                q_end_m   = q_start_m + 2
                q_end_y   = q_year
                if q_end_m > 12: q_end_m -= 12; q_end_y += 1
                q_end     = date(q_end_y, q_end_m, 1) + relativedelta(months=1)
                q_data    = delivered_qs.filter(
                    created_at__date__gte=q_start,
                    created_at__date__lt=q_end
                ).aggregate(revenue=Sum("total_amount"), orders=Count("id"))
                quarter_num = (q_start_m - 1) // 3 + 1
                revenue_quarterly.append({
                    "label":   f"Q{quarter_num} {q_year}",
                    "date":    str(q_start),
                    "revenue": float(q_data["revenue"] or 0),
                    "orders":  q_data["orders"] or 0,
                })

            # ── Yearly: last 5 years ───────────────────────────
            yearly_raw = (
                delivered_qs
                .annotate(period=TruncYear("created_at"))
                .values("period")
                .annotate(revenue=Sum("total_amount"), orders=Count("id"))
                .order_by("period")
            )
            year_map = {r["period"].year: r for r in yearly_raw}
            for i in range(5):
                y = now.year - 4 + i
                revenue_yearly.append({
                    "label":   str(y),
                    "date":    f"{y}-01-01",
                    "revenue": float(year_map[y]["revenue"]) if y in year_map else 0,
                    "orders":  year_map[y]["orders"] if y in year_map else 0,
                })

        except Exception as e:
            print(f"Stats order error: {e}")

        return Response({
            "total_products":     total_products,
            "low_stock":          low_stock,
            "out_of_stock":       out_of_stock,
            "categories":         list(categories),
            "total_users":        total_users,
            "total_cart_items":   total_cart_items,
            "total_orders":       total_orders,
            "total_revenue":      float(total_revenue),
            "pending_orders":     pending_orders,
            "orders_today":       orders_today,
            "recent_orders":      recent_orders,
            # all period graphs
            "revenue_daily":      revenue_daily,
            "revenue_weekly":     revenue_weekly,
            "revenue_monthly":    revenue_monthly,
            "revenue_quarterly":  revenue_quarterly,
            "revenue_yearly":     revenue_yearly,
        })

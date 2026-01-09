from django.urls import path
from . import views

urlpatterns = [
    path("plans/", views.PaymentPlanListView.as_view(), name="payment-plans"),
    path(
        "subscription/",
        views.AgentSubscriptionView.as_view(),
        name="agent-subscription",
    ),
    path("mpesa/initiate/", views.initiate_mpesa_payment, name="mpesa-initiate"),
    path("mpesa/webhook/", views.mpesa_webhook, name="mpesa-webhook"),
    path(
        "transactions/",
        views.MpesaTransactionListView.as_view(),
        name="transaction-list",
    ),
]

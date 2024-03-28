from celery import Celery

celery_app = Celery(
    "trading_bot",
    broker="redis://localhost:6379/0",
)

celery_app.conf.update(
    broker_connection_retry_on_startup=True,
    task_acks_late=True,
    worker_concurrency=100,
    task_routes={"app.routers.tradingbot.tasks.*": {"queue": "tradingbot"}},
)

celery_app.autodiscover_tasks(["app.routers.tradingbot"])

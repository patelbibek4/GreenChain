from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database.connection import Base, engine

# ============================================================
# MODELS
# Import all models so SQLAlchemy knows about all tables
# ============================================================

from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.models.wishlist import Wishlist
from app.models.review import Review
from app.models.cart import CartItem
from app.models.payment import Payment


# ============================================================
# ROUTERS
# ============================================================

from app.routers.users import router as users_router
from app.routers.farmer import router as farmer_router
from app.routers.products import router as products_router
from app.routers.marketplace import router as marketplace_router
from app.routers.orders import router as orders_router
from app.routers.wishlist import router as wishlist_router
from app.routers.reviews import router as reviews_router
from app.routers.cart import router as cart_router
from app.routers.payments import router as payments_router
from app.routers.admin import router as admin_router


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="GreenChain API",
    description="Smart Agricultural Marketplace for Nepal",
    version="1.0.0"
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DATABASE
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# PRODUCT IMAGE STORAGE
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

UPLOADS_DIR = BASE_DIR / "uploads"
PRODUCT_IMAGES_DIR = UPLOADS_DIR / "products"

# Create upload folders automatically
UPLOADS_DIR.mkdir(
    parents=True,
    exist_ok=True
)

PRODUCT_IMAGES_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# STATIC FILES
# ============================================================

# Example:
# http://127.0.0.1:8001/uploads/products/example.jpg

app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOADS_DIR)),
    name="uploads"
)


# ============================================================
# REGISTER ROUTERS
# ============================================================

app.include_router(users_router)
app.include_router(farmer_router)
app.include_router(products_router)
app.include_router(marketplace_router)
app.include_router(orders_router)
app.include_router(wishlist_router)
app.include_router(reviews_router)
app.include_router(cart_router)
app.include_router(payments_router)
app.include_router(admin_router)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Welcome to GreenChain 🌱",
        "status": "running",
        "version": "1.0.0"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
)
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductResponse
from app.security import require_role


# =========================================================
# ROUTER CONFIGURATION
# =========================================================

router = APIRouter(
    prefix="/farmer/products",
    tags=["Farmer Products"]
)


# =========================================================
# IMAGE UPLOAD CONFIGURATION
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

UPLOAD_DIR = BASE_DIR / "uploads" / "products"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

MAX_IMAGE_SIZE = 5 * 1024 * 1024


# =========================================================
# CREATE PRODUCT
# =========================================================

@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED
)
def create_product(
    product_data: ProductCreate,
    current_user: dict = Depends(
        require_role("farmer")
    ),
    db: Session = Depends(get_db)
):

    farmer_id = int(
        current_user.get("sub")
    )

    new_product = Product(
        farmer_id=farmer_id,
        name=product_data.name,
        description=product_data.description,
        category=product_data.category,
        price=product_data.price,
        quantity=product_data.quantity,
        unit=product_data.unit,
        location=product_data.location,
        image_url=None,
        is_available=True
    )

    db.add(new_product)

    db.commit()

    db.refresh(new_product)

    return new_product


# =========================================================
# GET FARMER PRODUCTS
# =========================================================

@router.get(
    "/",
    response_model=list[ProductResponse]
)
def get_farmer_products(
    current_user: dict = Depends(
        require_role("farmer")
    ),
    db: Session = Depends(get_db)
):

    farmer_id = int(
        current_user.get("sub")
    )

    products = (
        db.query(Product)
        .filter(
            Product.farmer_id == farmer_id
        )
        .order_by(Product.id.desc())
        .all()
    )

    return products


# =========================================================
# UPDATE PRODUCT
# =========================================================

@router.put(
    "/{product_id}",
    response_model=ProductResponse
)
def update_product(
    product_id: int,
    product_data: ProductCreate,
    current_user: dict = Depends(
        require_role("farmer")
    ),
    db: Session = Depends(get_db)
):

    farmer_id = int(
        current_user.get("sub")
    )

    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.farmer_id == farmer_id
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    product.name = product_data.name
    product.description = product_data.description
    product.category = product_data.category
    product.price = product_data.price
    product.quantity = product_data.quantity
    product.unit = product_data.unit
    product.location = product_data.location

    # Keep existing image_url when product information is updated.
    product.is_available = True

    db.commit()

    db.refresh(product)

    return product


# =========================================================
# UPLOAD PRODUCT IMAGE
# =========================================================

@router.post(
    "/{product_id}/image"
)
async def upload_product_image(
    product_id: int,
    image: UploadFile = File(...),
    current_user: dict = Depends(
        require_role("farmer")
    ),
    db: Session = Depends(get_db)
):

    farmer_id = int(
        current_user.get("sub")
    )

    # -----------------------------------------------------
    # FIND PRODUCT
    # -----------------------------------------------------

    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.farmer_id == farmer_id
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # -----------------------------------------------------
    # CHECK IMAGE TYPE
    # -----------------------------------------------------

    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid image type. "
                "Only JPG, PNG and WEBP images are allowed."
            )
        )

    # -----------------------------------------------------
    # READ IMAGE
    # -----------------------------------------------------

    image_data = await image.read()

    # -----------------------------------------------------
    # CHECK IMAGE SIZE
    # -----------------------------------------------------

    if len(image_data) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image file is empty."
        )

    if len(image_data) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image size must be 5 MB or smaller."
        )

    # -----------------------------------------------------
    # CREATE UNIQUE FILE NAME
    # -----------------------------------------------------

    extension = ALLOWED_IMAGE_TYPES[
        image.content_type
    ]

    file_name = (
        f"product_{product_id}_"
        f"{uuid4().hex}"
        f"{extension}"
    )

    file_path = UPLOAD_DIR / file_name

    # -----------------------------------------------------
    # SAVE IMAGE
    # -----------------------------------------------------

    try:
        with open(
            file_path,
            "wb"
        ) as file:

            file.write(image_data)

    except Exception as exc:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save product image."
        ) from exc

    # -----------------------------------------------------
    # DELETE OLD IMAGE FILE IF IT EXISTS
    # -----------------------------------------------------

    if product.image_url:

        old_file_name = Path(
            product.image_url
        ).name

        old_file_path = (
            UPLOAD_DIR / old_file_name
        )

        try:

            if (
                old_file_path.exists()
                and old_file_path != file_path
            ):
                old_file_path.unlink()

        except Exception:
            # Do not fail the upload if old-file cleanup fails.
            pass

    # -----------------------------------------------------
    # SAVE IMAGE URL IN DATABASE
    # -----------------------------------------------------

    product.image_url = (
        f"/uploads/products/{file_name}"
    )

    db.commit()

    db.refresh(product)

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "message": "Product image uploaded successfully",
        "product_id": product.id,
        "image_url": product.image_url
    }


# =========================================================
# DELETE PRODUCT
# =========================================================

@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_product(
    product_id: int,
    current_user: dict = Depends(
        require_role("farmer")
    ),
    db: Session = Depends(get_db)
):

    farmer_id = int(
        current_user.get("sub")
    )

    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.farmer_id == farmer_id
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # -----------------------------------------------------
    # DELETE PRODUCT IMAGE FILE
    # -----------------------------------------------------

    if product.image_url:

        file_name = Path(
            product.image_url
        ).name

        image_file = (
            UPLOAD_DIR / file_name
        )

        try:

            if image_file.exists():
                image_file.unlink()

        except Exception:
            pass

    # -----------------------------------------------------
    # DELETE PRODUCT
    # -----------------------------------------------------

    db.delete(product)

    db.commit()

    return None
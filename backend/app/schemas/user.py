from pydantic import BaseModel, EmailStr, Field


# =========================================================
# CREATE USER
# =========================================================

class UserCreate(BaseModel):

    name: str = Field(
        ...,
        min_length=2,
        max_length=100
    )

    email: EmailStr

    phone: str = Field(
        ...,
        min_length=7,
        max_length=20
    )

    password: str = Field(
        ...,
        min_length=8,
        max_length=128
    )

    # Public registration is only for customers and farmers.
    # Admin accounts must be created separately.
    role: str = Field(
        default="customer",
        min_length=8,
        max_length=8
    )


# =========================================================
# USER LOGIN
# =========================================================

class UserLogin(BaseModel):

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
        max_length=128
    )


# =========================================================
# USER RESPONSE
# =========================================================

class UserResponse(BaseModel):

    id: int
    name: str
    email: EmailStr
    phone: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


# =========================================================
# UPDATE USER PROFILE
# =========================================================

class UserProfileUpdate(BaseModel):

    name: str
    email: EmailStr
    phone: str
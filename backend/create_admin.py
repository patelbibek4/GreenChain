from pwdlib import PasswordHash

from app.database.connection import SessionLocal
from app.models.user import User


# =========================================================
# ADMIN ACCOUNT DETAILS
# =========================================================

ADMIN_NAME = "GreenChain Admin"
ADMIN_EMAIL = "admin@greenchain.com"
ADMIN_PHONE = "9863570691"
ADMIN_PASSWORD = "Admin@12345"


# =========================================================
# PASSWORD HASHING
# =========================================================

password_hash = PasswordHash.recommended()


# =========================================================
# DATABASE SESSION
# =========================================================

db = SessionLocal()


try:
    # -----------------------------------------------------
    # CHECK IF ADMIN EMAIL ALREADY EXISTS
    # -----------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(User.email == ADMIN_EMAIL)
        .first()
    )

    if existing_user:

        if existing_user.role == "admin":
            print("Admin account already exists.")
        else:
            print(
                "This email already belongs to another user."
            )

    else:

        # -------------------------------------------------
        # CHECK PHONE
        # -------------------------------------------------

        existing_phone = (
            db.query(User)
            .filter(User.phone == ADMIN_PHONE)
            .first()
        )

        if existing_phone:
            print(
                "This phone number is already registered."
            )

        else:

            # ---------------------------------------------
            # CREATE ADMIN
            # ---------------------------------------------

            admin = User(
                name=ADMIN_NAME,
                email=ADMIN_EMAIL,
                phone=ADMIN_PHONE,
                password_hash=password_hash.hash(
                    ADMIN_PASSWORD
                ),
                role="admin",
                is_active=True
            )

            db.add(admin)
            db.commit()
            db.refresh(admin)

            print("")
            print("====================================")
            print("ADMIN ACCOUNT CREATED SUCCESSFULLY")
            print("====================================")
            print(f"Admin ID: {admin.id}")
            print(f"Name: {admin.name}")
            print(f"Email: {admin.email}")
            print(f"Role: {admin.role}")
            print(f"Active: {admin.is_active}")
            print("====================================")


except Exception as error:

    db.rollback()

    print("")
    print("ERROR CREATING ADMIN ACCOUNT")
    print("------------------------------------")
    print(error)


finally:

    db.close()
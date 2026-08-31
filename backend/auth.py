import os

from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError

from authlib.integrations.starlette_client import OAuth

from fastapi import (
    APIRouter,
    Request,
    Depends,
    HTTPException,
)

from fastapi.responses import RedirectResponse, JSONResponse

from sqlalchemy.orm import Session

from database import get_db
from models import UserDB


oauth = OAuth()


oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url=(
        "https://accounts.google.com/"
        ".well-known/openid-configuration"
    ),
    client_kwargs={
        "scope": "openid email profile",
    },
)


GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
FRONTEND_URL = os.getenv("FRONTEND_URL")

IS_PRODUCTION = os.getenv("ENVIRONMENT") == "production"

# In production the frontend and backend live on different domains, so
# the auth cookie is cross-site. Browsers only send such a cookie when it
# is SameSite=None, and they only accept SameSite=None when it is Secure.
COOKIE_SAMESITE = "none" if IS_PRODUCTION else "lax"
COOKIE_SECURE = IS_PRODUCTION

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(
    os.getenv("JWT_EXPIRE_MINUTES", "60")
)


router = APIRouter(prefix="/auth")


def create_access_token(user_id: int) -> str:
    """Create a JWT for an authenticated user."""

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=JWT_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expire,
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


@router.get("/google")
async def google_login(request: Request):
    """Start Google OAuth login."""

    return await oauth.google.authorize_redirect(
        request,
        GOOGLE_REDIRECT_URI,
    )


@router.get("/google/callback")
async def google_callback(
    request: Request,
    db: Session = Depends(get_db),
):
    """Handle Google OAuth callback and create login cookie."""

    # Get Google access token
    token = await oauth.google.authorize_access_token(request)

    # Get Google user information
    user_info = token["userinfo"]

    google_id = user_info["sub"]
    email = user_info["email"]
    name = user_info.get("name")
    picture = user_info.get("picture")

    # Find existing user by Google ID
    user_db = (
        db.query(UserDB)
        .filter(UserDB.google_id == google_id)
        .first()
    )

    # If not found, try email
    if not user_db:
        user_db = (
            db.query(UserDB)
            .filter(UserDB.email == email)
            .first()
        )

    # Create user if they don't exist
    if not user_db:
        user_db = UserDB(
            google_id=google_id,
            email=email,
            username=name,
            profile_picture=picture,
        )

        db.add(user_db)
        db.commit()
        db.refresh(user_db)

    # Make sure inactive users cannot log in
    if not user_db.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive",
        )

    # Create JWT
    access_token = create_access_token(user_db.id)

    # Redirect to frontend TailorCV page
    response = RedirectResponse(
        url=f"{FRONTEND_URL}/tailor"
    )

    # Store JWT in HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=60 * JWT_EXPIRE_MINUTES,
        path="/",
    )

    return response


async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
):
    """Get the authenticated user from the JWT cookie."""

    # Get JWT from HttpOnly cookie
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )

        user_id_raw = payload.get("sub")

        if user_id_raw is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token",
            )

        try:
            user_id = int(user_id_raw)
        except (TypeError, ValueError):
            raise HTTPException(
                status_code=401,
                detail="Invalid token",
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    # Find user in database
    user = (
        db.query(UserDB)
        .filter(UserDB.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=401,
            detail="User account is inactive",
        )

    return user


@router.get("/me")
async def get_me(
    current_user: UserDB = Depends(get_current_user),
):
    """Return the currently authenticated user."""

    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.username,
        "profile_picture": current_user.profile_picture,
    }


@router.post("/logout")
async def logout():
    """Clear the authentication cookie."""

    response = JSONResponse(
        content={
            "message": "Logged out successfully"
        }
    )

    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/",
    )

    return response
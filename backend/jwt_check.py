"""Standalone JWT round-trip audit script. Does NOT print SECRET_KEY value."""
from app.core.config import settings
from app.core.security import create_access_token
from jose import jwt, JWTError


def main():
    sk = settings.SECRET_KEY or ""
    print(f"ALGORITHM={settings.ALGORITHM}")
    print(f"ACCESS_TOKEN_EXPIRE_MINUTES={settings.ACCESS_TOKEN_EXPIRE_MINUTES}")
    print(f"SECRET_KEY present={bool(sk)} length={len(sk)} (value redacted)")

    token = create_access_token(data={"sub": "dummy-user-id-123"})
    print(f"Token created (len={len(token)})")

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        redacted = {k: ("<redacted>" if k == "SECRET_KEY" else v) for k, v in payload.items()}
        print(f"Decoded claims: {redacted}")
        print("PASS: round-trip decode succeeded")
    except JWTError as e:
        print(f"FAIL: {type(e).__name__}: {e}")


if __name__ == "__main__":
    main()

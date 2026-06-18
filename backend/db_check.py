"""
Standalone Supabase PostgreSQL connection verification script.

- Reuses the app's engine construction logic (app.database.engine), which is
  built from settings.DATABASE_URL loaded from the .env file.
- Connects, runs SELECT version(), lists public tables, and checks for the
  presence of each expected model table.
- Does NOT print credentials/secrets.
"""

import sys
import traceback

# Expected tables derived from the SQLAlchemy models (__tablename__ values).
EXPECTED_TABLES = ["users", "expenses", "budgets"]


def main():
    print("=" * 60)
    print("Supabase PostgreSQL Connection Check")
    print("=" * 60)

    # Reuse the SAME engine the app uses. app.core.config loads .env via
    # pydantic-settings (env_file=".env"), and app.database builds the engine
    # from settings.DATABASE_URL. This avoids hardcoding credentials.
    try:
        from sqlalchemy import text
        from app.database import engine
        # Import models so metadata is populated (not strictly required here,
        # but mirrors how the app loads things).
        import app.models  # noqa: F401
    except Exception as exc:
        print("\n[SETUP ERROR] Could not import the app's engine/config.")
        print(f"  Exception type: {type(exc).__name__}")
        print(f"  Message: {exc}")
        traceback.print_exc()
        sys.exit(1)

    # Show a redacted view of the target host so we know where we're connecting,
    # without exposing the password.
    try:
        url = engine.url  # SQLAlchemy URL object
        driver = url.drivername  # e.g. postgresql or postgresql+asyncpg
        host = url.host
        port = url.port
        database = url.database
        print(f"\nDriver:   {driver}")
        print(f"Host:     {host}")
        print(f"Port:     {port}")
        print(f"Database: {database}")
        is_async = "+asyncpg" in driver or "+aiopg" in driver or driver.endswith("async")
    except Exception:
        is_async = False
        print("\n(Could not introspect engine URL details; continuing.)")

    try:
        if is_async:
            _run_async(engine)
        else:
            _run_sync(engine)
    except Exception as exc:
        print("\n" + "=" * 60)
        print("[CONNECTION FAILED]")
        print("=" * 60)
        print(f"  Exception type: {type(exc).__name__}")
        print(f"  Message: {exc}")
        print("\nFull traceback:")
        traceback.print_exc()
        sys.exit(2)


def _run_sync(engine):
    from sqlalchemy import text
    with engine.connect() as conn:
        version = conn.execute(text("SELECT version();")).scalar()
        print("\n[CONNECTED] Engine connected successfully.")
        print(f"Postgres version: {version}")

        rows = conn.execute(text(
            "SELECT table_name FROM information_schema.tables "
            "WHERE table_schema='public' ORDER BY table_name"
        )).fetchall()
        _report(rows)


def _run_async(engine):
    import asyncio
    from sqlalchemy import text

    async def _go():
        async with engine.connect() as conn:
            version = (await conn.execute(text("SELECT version();"))).scalar()
            print("\n[CONNECTED] Engine connected successfully.")
            print(f"Postgres version: {version}")

            result = await conn.execute(text(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema='public' ORDER BY table_name"
            ))
            rows = result.fetchall()
            _report(rows)

    asyncio.run(_go())


def _report(rows):
    existing = [r[0] for r in rows]

    print("\nTables found in public schema:")
    if existing:
        for t in existing:
            print(f"  - {t}")
    else:
        print("  (none)")

    print("\nExpected model table checks:")
    all_present = True
    for t in EXPECTED_TABLES:
        if t in existing:
            print(f"  PASS  {t} (present)")
        else:
            all_present = False
            print(f"  FAIL  {t} (MISSING)")

    print("\n" + "=" * 60)
    if all_present:
        print("RESULT: All expected tables are present.")
    else:
        print("RESULT: Some expected tables are MISSING (see above).")
    print("=" * 60)


if __name__ == "__main__":
    main()

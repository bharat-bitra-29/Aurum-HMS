# Aurum — Architecture Notes

## Portal Separation Rules

Each portal is completely isolated. The hard rules:

1. **Portals never import from each other.**
   - `portals/admin/` only imports from `shared/`
   - `portals/hotel/` only imports from `shared/`
   - `portals/user/`  only imports from `shared/`

2. **Each portal has its own AuthGuard** that checks the JWT role claim before rendering any page.

3. **Backend routers are role-gated at the router level**, not the individual route level.
   - `/api/admin/*` → `require_role("platform_admin")`
   - `/api/hotel/*` → `require_role("hotel_admin")`
   - `/api/user/*`  → `require_role("user")`
   - `/api/auth/*` and `/api/public/*` → no auth required

4. **A single `/api/auth/login` endpoint** issues a JWT with the role embedded. The frontend reads the role and redirects to the correct portal root.

## Role Map

| Role             | Portal route  | Backend prefix  |
|------------------|---------------|-----------------|
| `platform_admin` | `/admin/*`    | `/api/admin/*`  |
| `hotel_admin`    | `/hotel/*`    | `/api/hotel/*`  |
| `user`           | `/app/*`      | `/api/user/*`   |

## Commission Flow

1. User creates booking → status: `pending`
2. Hotel admin confirms booking → status: `confirmed`
3. `commission_service.create_commission()` auto-fires on confirmation
4. Commission = `booking.total_amount × 0.10` (10% platform rate)
5. Platform admin views earnings in `/admin/commission`

## Booking Status Machine

```
pending → confirmed → completed
pending → cancelled
confirmed → cancelled
confirmed → completed
```
from routers.public.auth import router as auth_router
from routers.public.hotels import router as public_hotels_router
from routers.admin.dashboard import router as admin_dashboard_router
from routers.admin.hotels import router as admin_hotels_router
from routers.admin.users import router as admin_users_router
from routers.admin.commission import router as admin_commission_router
from routers.admin.management import router as admin_management_router
from routers.hotel.registration import router as hotel_reg_router
from routers.hotel.rooms import router as hotel_rooms_router
from routers.hotel.bookings import router as hotel_bookings_router
from routers.hotel.revenue import router as hotel_revenue_router
from routers.hotel.property import router as hotel_property_router
from routers.user.search import router as user_search_router
from routers.user.bookings import router as user_bookings_router
from routers.user.profile import router as user_profile_router
from routers.user.loyality import router as user_loyalty_router
from routers.user.group_booking import router as user_group_router
from routers.user.messaging import router as user_messaging_router

all_routers = [
    auth_router, public_hotels_router,
    admin_dashboard_router, admin_hotels_router, admin_users_router,
    admin_commission_router, admin_management_router,
    hotel_reg_router, hotel_rooms_router, hotel_bookings_router,
    hotel_revenue_router, hotel_property_router,
    user_search_router, user_bookings_router, user_profile_router,
    user_loyalty_router, user_group_router, user_messaging_router,
]
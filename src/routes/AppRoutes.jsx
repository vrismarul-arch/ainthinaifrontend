import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Home from "../pages/Home/Home";
import Product from "../pages/product/Product";
import Login from "../pages/login/Login";

import AdminLogin from "../pages/admin/AdminLogin";
import AdminRoute from "./AdminRoute";
import AdminLayout from "../pages/admin/layout/AdminLayout";
import Profile from "../pages/admin/dashboard/Profile";
import Dashboard from "../pages/admin/dashboard/Dashboard";
import AdminTours from "../pages/admin/pages/AdminTours";
import AdminAmenities from "../pages/admin/pages/AdminAmenities";
import AdminItinerary from "../pages/admin/pages/AdminItinerary";
import AdminCategories from "../pages/admin/pages/AdminCreateCategories";
import BookingCard from "../pages/product/BookingCard";
import AdminBookings from "../pages/admin/pages/AdminBookings";
import ProfilePage from "../pages/login/ProfilePage";
import UserBookingDetails from "../pages/product/UserBookingDetails";
import MyBookings from "../pages/product/MyBookings";

const AppRoutes = () => {

  const { pathname } = useLocation();

  // ✅ Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth" // remove if you want instant scroll
    });
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<Product />} />
      <Route path="/product/:id/booking" element={<BookingCard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/booking/:id" element={<UserBookingDetails />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin/profile"
        element={
          <AdminRoute>
            <AdminLayout>
              <Profile />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/booking"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminBookings />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/tours"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminTours />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/categories"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminCategories />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/amenities"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminAmenities />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/itinerary"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminItinerary />
            </AdminLayout>
          </AdminRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;

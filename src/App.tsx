import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import AddArtists from "./pages/Artists/AddArtists";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./pages/AuthPages/ProtectedRoute";
import CategoriesList from "./pages/ArtForms/Categories/CategoriesList";
import AddCategories from "./pages/ArtForms/Categories/AddCategory";
import ArtDetailLists from "./pages/ArtForms/ArtDetails/ArtDetailsLists";
import AddArtDetails from "./pages/ArtForms/ArtDetails/AddArtDetails";
import EventsLists from "./pages/Events/EventsLists";
import AddEvents from "./pages/Events/AddEvents";
import ContibutionLists from "./pages/Contibutions/ContributionLists";
import { useEffect } from "react";
import { autoLogout, startIdleLogout } from "./pages/AuthPages/Auth";
import ApplicationsList from "./pages/Applications/ApplicationsList";
import EventApplicationsList from "./pages/Applications/EventApplicationsList";
import ArtistsLists from "./pages/Artists/ArtistsList";

export default function App() {
  useEffect(() => {
    autoLogout(); // token expiry
    startIdleLogout(10); // idle 10 min
  }, []);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            {/* <Route path="/profile" element={<UserProfiles />} /> */}
            <Route path="/artists" element={<ArtistsLists />} />
            <Route path="/artists/add" element={<AddArtists />} />

            {/* Art Forms */}
            <Route path="/categories" element={<CategoriesList />} />
            <Route path="/categories/add" element={<AddCategories />} />
            <Route path="/art-details" element={<ArtDetailLists />} />
            <Route path="/art-details/add" element={<AddArtDetails />} />

            {/* Events */}
            <Route path="/events" element={<EventsLists />} />
            <Route path="/events/add" element={<AddEvents />} />

            {/* Contributes */}
            <Route path="/contributions" element={<ContibutionLists />} />

            {/* Art Form Applications */}
            <Route path="/applications" element={<ApplicationsList/>} />

            {/* Event Applications */}
            <Route path="/eventApplications" element={<EventApplicationsList/>} />
 
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

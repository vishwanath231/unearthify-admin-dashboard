import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
// import Videos from "./pages/UiElements/Videos";
// import Images from "./pages/UiElements/Images";
// import Alerts from "./pages/UiElements/Alerts";
// import Badges from "./pages/UiElements/Badges";
// import Avatars from "./pages/UiElements/Avatars";
// import Buttons from "./pages/UiElements/Buttons";
// import LineChart from "./pages/Charts/LineChart";
// import BarChart from "./pages/Charts/BarChart";
// import BasicTables from "./pages/Tables/BasicTables";
// import FormElements from "./pages/Forms/FormElements";
// import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
// import UserProfiles from "./pages/UserProfiles";
// import FormElements from "./pages/Forms/FormElements";
// import BasicTables from "./pages/Tables/BasicTables";
import Artists from "./pages/Artists/ArtistsList";
import AddArtists from "./components/Artists/AddArtists";
// import BasicTableOne from "./components/tables/BasicTables/BasicTableOne";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./pages/AuthPages/ProtectedRoute";
// import CategoryPage from "./pages/ArtForms/Categories/AddCategory";
// import ArtFormsPage from "./pages/ArtForms/ArtTypes/AddArtTypes";
// import ArtFormDetails from "./pages/ArtForms/ArtFormDetail";
import CategoriesList from "./pages/ArtForms/Categories/CategoriesList";
import AddCategories from "./pages/ArtForms/Categories/AddCategory";
import ArtDetailLists from "./pages/ArtForms/ArtDetails/ArtDetailsLists";
import AddArtDetails from "./pages/ArtForms/ArtDetails/AddArtDetails";
import EventsLists from "./pages/Events/EventsLists";
import AddEvents from "./pages/Events/AddEvents";
import ContibutionLists from "./pages/Contibutions/ContributionLists";
import AddContibutions from "./pages/Contibutions/AddContributions";
import { useEffect } from "react";
import { autoLogout, startIdleLogout } from "./pages/AuthPages/Auth";

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
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/artists/add" element={<AddArtists />} />
            {/* <Route path="/blank" element={<Blank />} /> */}

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
            <Route path="/contribution/add" element={<AddContibutions />} />
 
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

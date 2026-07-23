import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoadingScreen } from '../shared/components/Feedback'
import { PublicLayout } from './layouts/PublicLayout'
import { HomePage } from './pages/HomePage'

const AuthRoute = lazy(() =>
  import('./routes/AuthRoute').then((module) => ({ default: module.AuthRoute })),
)
const BudgetPage = lazy(() =>
  import('../features/expenses/pages/BudgetPage').then((module) => ({ default: module.BudgetPage })),
)
const PlanPage = lazy(() =>
  import('../features/itinerary/pages/PlanPage').then((module) => ({ default: module.PlanPage })),
)
const CalendarPage = lazy(() =>
  import('../features/itinerary/pages/CalendarPage').then((module) => ({ default: module.CalendarPage })),
)
const RoutePage = lazy(() =>
  import('../features/itinerary/pages/RoutePage').then((module) => ({ default: module.RoutePage })),
)
const PreparationPage = lazy(() =>
  import('../features/preparation/pages/PreparationPage').then((module) => ({ default: module.PreparationPage })),
)
const TripSettingsPage = lazy(() =>
  import('../features/trip-settings/pages/TripSettingsPage').then((module) => ({ default: module.TripSettingsPage })),
)
const PublicProfilePage = lazy(() =>
  import('../features/profile/pages/PublicProfilePage').then((module) => ({ default: module.PublicProfilePage })),
)
const AppProfilePage = lazy(() =>
  import('../features/profile/pages/AppProfilePage').then((module) => ({ default: module.AppProfilePage })),
)
const PeoplePage = lazy(() =>
  import('../features/social/pages/PeoplePage').then((module) => ({ default: module.PeoplePage })),
)
const PublicTripPage = lazy(() =>
  import('../features/profile/pages/PublicTripPage').then((module) => ({ default: module.PublicTripPage })),
)
const TripLayout = lazy(() =>
  import('../features/trips/pages/TripLayout').then((module) => ({ default: module.TripLayout })),
)
const TripsPage = lazy(() =>
  import('../features/trips/pages/TripsPage').then((module) => ({ default: module.TripsPage })),
)
const ProtectedRoute = lazy(() =>
  import('./routes/ProtectedRoute').then((module) => ({ default: module.ProtectedRoute })),
)

function NotFoundPage() {
  return (
    <div className="py-24 text-center">
      <p className="text-7xl font-black text-teal-800">404</p>
      <h1 className="mt-4 text-2xl font-black">Bu rota haritada yok.</h1>
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<AuthRoute mode="login" />} />
            <Route path="register" element={<AuthRoute mode="register" />} />
            <Route path="u/:username" element={<PublicProfilePage />} />
            <Route path="u/:username/trips/:tripId" element={<PublicTripPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="app" element={<ProtectedRoute />}>
            <Route index element={<Navigate to="trips" replace />} />
            <Route path="trips" element={<TripsPage />} />
            <Route path="people" element={<PeoplePage />} />
            <Route path="people/:username" element={<AppProfilePage />} />
            <Route path="profile" element={<AppProfilePage />} />
            <Route path="trips/:tripId" element={<TripLayout />}>
              <Route index element={<Navigate to="list" replace />} />
              <Route path="plan" element={<Navigate to="../list" replace />} />
              <Route path="list" element={<PlanPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="route" element={<RoutePage />} />
              <Route path="budget" element={<BudgetPage />} />
              <Route path="preparation" element={<PreparationPage />} />
              <Route path="settings" element={<TripSettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

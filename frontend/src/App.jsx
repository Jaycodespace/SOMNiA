import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import {ToastContainer} from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Navigation from "./components/navigation/Navigation"
import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ResetPassword from "./pages/ResetPassword"
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm"
import Activate from "./pages/Activate"
import NotFound from "./pages/NotFound"



function App() {
  return (
    <>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword/>} />
          <Route path="/password/reset/confirm/:uid/:token" element={<ResetPasswordConfirm />} />
          <Route path="/activate/:uid/:token" element={<Activate />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Router>
      <ToastContainer/>
    </>
  )
}

export default App
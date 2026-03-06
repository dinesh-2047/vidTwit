import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  registerUser,
  resendRegistrationOtp,
  verifyRegistrationOtp,
} from "../api"

export default function Register() {
  const navigate = useNavigate()
  const [mode, setMode] = useState("register")

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  })

  const [avatar, setAvatar] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [otp, setOtp] = useState("")
  const [verificationEmail, setVerificationEmail] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendingOtp, setResendingOtp] = useState(false)

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    if (!formData.fullName || !formData.username || !formData.email || !formData.password || !avatar) {
      setError("Please fill in all required fields")
      return
    }

    if(formData.password.length < 6){
      setError("Password must be at least 6 characters")
      return
    }

    const form = new FormData()
    form.append("fullName", formData.fullName)
    form.append("username", formData.username)
    form.append("email", formData.email)
    form.append("password", formData.password)
    form.append("avatar", avatar)
    if (coverImage) form.append("coverImage", coverImage)

    try {
      setLoading(true)
      const res = await registerUser(form, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setVerificationEmail(res.data?.data?.email || formData.email)
      setMode("verify")
      setOtp("")
      setSuccessMessage(res.data?.message || "Registration successful. Enter the OTP sent to your email.")
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async e => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    if (!verificationEmail || !otp) {
      setError("Email and OTP are required")
      return
    }

    try {
      setLoading(true)
      const res = await verifyRegistrationOtp({
        email: verificationEmail,
        otp,
      })

      setSuccessMessage(res.data?.message || "Email verified successfully. Redirecting to login...")
      setTimeout(() => {
        navigate("/login")
      }, 1200)
    } catch (err) {
      setError(err?.response?.data?.message || "OTP verification failed")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError("")
    setSuccessMessage("")

    if (!verificationEmail) {
      setError("Enter your email first")
      return
    }

    try {
      setResendingOtp(true)
      const res = await resendRegistrationOtp({ email: verificationEmail })
      setSuccessMessage(res.data?.message || "A new OTP has been sent to your email")
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to resend OTP")
    } finally {
      setResendingOtp(false)
    }
  }

  return (
      <div className="max-w-md mx-auto mt-10 p-6  rounded-xl shadow-md bg-gradient-to-br from-gray-950 via-slate-600 to-black">
        <h2 className="text-2xl font-semibold mb-4 text-center text-white">
          {mode === "register" ? "Register" : "Verify Email"}
        </h2>

        {error && (
          <div className="alert alert-error text-sm mb-4">
            <span className="text-white text-center">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success text-sm mb-4">
            <span className="text-white text-center">{successMessage}</span>
          </div>
        )}

        {mode === "register" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="input input-bordered w-full"
            />

            <div>
              <label className="label">
                <span className="label-text text-white">Avatar (required)</span>
              </label>
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={e => setAvatar(e.target.files[0])}
                className="file-input file-input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text text-white">Cover Image (optional)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                name="coverImage"
                onChange={e => setCoverImage(e.target.files[0])}
                className="file-input file-input-bordered w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <button
              type="button"
              className="btn btn-outline w-full"
              onClick={() => {
                setMode("verify")
                setVerificationEmail(formData.email)
                setError("")
                setSuccessMessage("")
              }}
            >
              Already have an OTP?
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-100">
                Already have account?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Login here
                </Link>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="email"
              name="verificationEmail"
              placeholder="Email"
              value={verificationEmail}
              onChange={e => setVerificationEmail(e.target.value)}
              className="input input-bordered w-full"
            />
            <input
              type="text"
              name="otp"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="input input-bordered w-full"
            />

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              disabled={resendingOtp}
              className="btn btn-secondary w-full"
              onClick={handleResendOtp}
            >
              {resendingOtp ? "Sending..." : "Resend OTP"}
            </button>

            <button
              type="button"
              className="btn btn-outline w-full"
              onClick={() => {
                setMode("register")
                setError("")
                setSuccessMessage("")
              }}
            >
              Back to registration
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-100">
                Verified already?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Login here
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
  )

}

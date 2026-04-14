import { useState, useEffect } from 'react'
import "prismjs/themes/prism-tomorrow.css"
import prism from "prismjs"
import axios from 'axios'
import Markdown from 'react-markdown'

function Reviewer() {
  const [code, setCode] = useState(`function sum() {
  return a + b
}`)
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    prism.highlightAll()
  }, [])

  async function reviewCode() {
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:3001/ai/get-review', { code })
      setReview(response.data)
    } catch (error) {
      console.error("Error fetching review:", error)
      const errorMsg = error.response?.data || error.message || "Unknown Error";
      setReview(`### ❌ Connection Error\n${errorMsg}\n\n*Make sure your backend server is running on port 3001.*`)
    }
    setLoading(false)
  }

  const logout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return (
    <>
      <header>
        <div className="logo">
          <h1>✨ Smart Reviewer</h1>
        </div>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>
      <main>
        <div className="left">
          <div className="code">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
            />
          </div>
          <button
            onClick={reviewCode}
            disabled={loading}
            className="review-btn"
          >
            {loading ? "Reviewing..." : "Review Code"}
          </button>
        </div>
        <div className="right">
          <div className="review">
            {review ? <Markdown>{review}</Markdown> : (
              <div className="empty-state">
                <h2>Ready for review!</h2>
                <p>Paste some code on the left and click the button to get AI feedback.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export default Reviewer

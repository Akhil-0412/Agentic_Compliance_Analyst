import streamlit as st
import time
import requests
from streamlit_lottie import st_lottie

# --- ASSETS ---
LOTTIE_URL = "https://assets9.lottiefiles.com/packages/lf20_jcikwtux.json"  # Secure Lock Animation

def load_lottieurl(url: str):
    r = requests.get(url)
    if r.status_code != 200:
        return None
    return r.json()

def login_form():
    """
    Renders a modern, visually appealing login form with Lottie animation.
    """
    # 1. Custom CSS for Fluid Design
    st.markdown("""
        <style>
            .stTextInput > div > div > input {
                border-radius: 10px;
                padding: 10px;
            }
            .stButton > button {
                border-radius: 20px;
                width: 100%;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            .stButton > button:hover {
                transform: scale(1.02);
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            .google-btn {
                background-color: white !important;
                color: #555 !important;
                border: 1px solid #ddd !important;
            }
            .login-container {
                padding: 2rem;
                border-radius: 20px;
                background: linear-gradient(145deg, #1e1e1e, #2a2a2a);
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            }
        </style>
    """, unsafe_allow_html=True)

    # 2. Layout: Centered Card
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown("<div class='login-container'>", unsafe_allow_html=True)
        
        # Animation
        lottie_json = load_lottieurl(LOTTIE_URL)
        if lottie_json:
            st_lottie(lottie_json, height=200, key="auth_anim")
        
        st.title("Admin Access")
        st.markdown("**Enter your credentials to access the Governance Dashboard.**")

        # Login Form
        email = st.text_input("Email Address", placeholder="admin@corp.global")
        password = st.text_input("Password", type="password", placeholder="••••••••")

        c1, c2 = st.columns(2)
        with c1:
            if st.button("Sign in with Email", type="primary"):
                if email and password:
                    with st.spinner("Authenticating..."):
                        time.sleep(1.5) # Simulate API latency
                        st.session_state["authenticated"] = True
                        st.session_state["user_name"] = email.split("@")[0].title()
                        st.session_state["user_role"] = "admin"
                        st.balloons()
                        st.rerun()
                else:
                    st.error("Please fill in all fields.")

        with c2:
            # Mock Google Sign In
            if st.button("🇬 Google Sign In", help="Simulated OAuth"):
                with st.spinner("Connecting to Google..."):
                    time.sleep(1.5)
                    st.session_state["authenticated"] = True
                    st.session_state["user_name"] = "Google User"
                    st.session_state["user_role"] = "viewer"
                    st.rerun()
                    
        st.markdown("</div>", unsafe_allow_html=True)
        st.markdown("---")
        st.caption("🔒 Secured by Agentic Governance Protocol v2.0")

def login_page():
    """
    Wrapper to display the login page.
    """
    login_form()
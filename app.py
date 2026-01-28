import streamlit as st
import time
import os
import json
import datetime
import pandas as pd
from dotenv import load_dotenv
import phoenix as px
from streamlit_option_menu import option_menu
from streamlit_lottie import st_lottie
import requests

# --- CUSTOM MODULES ---
from auth import login_page
from agent.analyst import ComplianceAgent
from retrieval.indexer import ClauseIndexer
from agent.schemas import ComplianceResponse

# --- CONFIG & ASSETS ---
st.set_page_config(page_title="ComplianceOS", page_icon="🛡️", layout="wide")
load_dotenv()

LOTTIE_HOME = "https://assets5.lottiefiles.com/packages/lf20_V9t630.json" # Futuristic Dashboard

def load_lottieurl(url: str):
    try:
        r = requests.get(url) 
        return r.json() if r.status_code == 200 else None
    except: return None

# --- CSS STYLING (GLASSMORPHISM) ---
st.markdown("""
    <style>
        /* Main Background */
        .stApp {
            background-color: #0E1117;
        }
        /* Sidebar */
        section[data-testid="stSidebar"] {
            background-color: #161B22; 
        }
        /* Cards */
        .metric-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            transition: transform 0.3s;
        }
        .metric-card:hover {
            transform: translateY(-5px);
            border-color: rgba(255, 255, 255, 0.3);
        }
        /* Headers */
        h1, h2, h3 {
            font-family: 'Inter', sans-serif;
            color: #E6EDF3;
        }
    </style>
""", unsafe_allow_html=True)

# --- INIT STATE ---
if "authenticated" not in st.session_state: st.session_state["authenticated"] = False
if "domain" not in st.session_state: st.session_state["domain"] = None
if "messages" not in st.session_state: st.session_state.messages = []
if "governance_vault" not in st.session_state: st.session_state.governance_vault = {}

# --- OBSERVABILITY ---
try:
    if "px_session" not in st.session_state:
        st.session_state.px_session = px.launch_app()
    px_url = "http://localhost:6006"
except: px_url = None

# --- AUTH CHECK ---
if not st.session_state["authenticated"]:
    login_page()
    st.stop()

# --- CACHED RESOURCES ---
@st.cache_resource
def get_agent(domain):
    # Load correct data based on Domain
    if domain == "GDPR":
        data_path = "data/processed/gdpr_structured.json"
        try:
            with open(data_path, "r", encoding="utf-8") as f:
                gdpr_doc = json.load(f)
            texts, metadata = [], []
            for article in gdpr_doc['articles']:
                title, art_id = article['title'], article['article_id']
                for clause in article['clauses']:
                    texts.append(f"Article {art_id} - {title}: {clause['text']}")
                    metadata.append({"article_id": art_id, "clause_id": clause['clause_id'], "text": clause['text']})
            indexer = ClauseIndexer()
            indexer.build(texts, metadata)
            return ComplianceAgent(indexer, data_path, domain="GDPR")
        except FileNotFoundError: return None
        
    elif domain == "FDA":
        # Placeholder Indexer for FDA (Tavily Only)
        indexer = ClauseIndexer() 
        return ComplianceAgent(indexer, "data/dummy.json", domain="FDA")

# --- SIDEBAR NAVIGATION ---
with st.sidebar:
    st.title("🛡️ ComplianceOS")
    if st.session_state["domain"]:
        st.caption(f"Active Domain: **{st.session_state['domain']}**")
        if st.button("Change Domain"):
            st.session_state["domain"] = None
            st.rerun()
            
    selected = option_menu(
        "Navigation", 
        ["Home", "Agent Chat", "Audit Logs", "FDA Search", "Accounts"], 
        icons=['house', 'chat-dots', 'file-earmark-lock', 'search', 'person-circle'],
        menu_icon="cast", default_index=0,
        styles={
            "container": {"background-color": "transparent"},
            "icon": {"color": "#00d4ff", "font-size": "20px"}, 
            "nav-link": {"font-size": "16px", "text-align": "left", "margin":"5px"},
            "nav-link-selected": {"background-color": "#21262d"}
        }
    )
    
    st.divider()
    if px_url:
        st.markdown(f"🔭 **[TraceView]({px_url})**")
    if st.button("Log Out"):
        st.session_state["authenticated"] = False
        st.rerun()

# --- PAGE: HOME (GLOBAL ROUTER) ---
if selected == "Home":
    st.title("Welcome, Administrator")
    
    # Global Router
    if not st.session_state["domain"]:
        st.markdown("### 🌐 Select Compliance Domain")
        c1, c2 = st.columns(2)
        with c1:
            st.markdown("<div class='metric-card'>", unsafe_allow_html=True)
            st.subheader("🇪🇺 GDPR")
            st.write("General Data Protection Regulation. European Union.")
            if st.button("Launch GDPR Workspace", use_container_width=True):
                st.session_state["domain"] = "GDPR"
                st.session_state.messages = [] # Reset chat on switch
                st.rerun()
            st.markdown("</div>", unsafe_allow_html=True)
            
        with c2:
            st.markdown("<div class='metric-card'>", unsafe_allow_html=True)
            st.subheader("🇺🇸 FDA")
            st.write("Food & Drug Administration. United States.")
            if st.button("Launch FDA Workspace", use_container_width=True):
                st.session_state["domain"] = "FDA"
                st.session_state.messages = []
                st.rerun()
            st.markdown("</div>", unsafe_allow_html=True)
            
        # Animation
        lottie_home = load_lottieurl(LOTTIE_HOME)
        if lottie_home: st_lottie(lottie_home, height=400)
    
    else:
        # Dashboard Stats (Mock)
        c1, c2, c3 = st.columns(3)
        c1.metric("Compliance Score", "98%", "+2%")
        c2.metric("Open Risks", "3", "-1")
        c3.metric("Policy version", "v4.2.1")
        
        st.info(f"You are currently operating in the **{st.session_state['domain']}** workspace. Switch to 'Agent Chat' to begin.")

# --- PAGE: AGENT CHAT ---
elif selected == "Agent Chat":
    if not st.session_state["domain"]:
        st.warning("⚠️ Please select a Domain on the Home page first.")
        st.stop()
        
    st.header(f"💬 {st.session_state['domain']} Compliance Agent")
    
    # Initialize Agent
    agent = get_agent(st.session_state["domain"])
    if not agent:
        st.error(f"Failed to load agent for {st.session_state['domain']}")
        st.stop()

    # Chat History
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # Input
    if prompt := st.chat_input("Ask a question..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            with st.spinner("Analyzing regulations..."):
                response = agent.analyze(prompt)
                
                # Check for Structure vs String
                if isinstance(response, ComplianceResponse):
                    # Render Card
                    st.subheader(response.summary)
                    c1, c2 = st.columns(2)
                    c1.success(f"Confidence: {response.confidence_score*100:.0f}%")
                    cols_map = {"low":"green", "medium":"orange", "high":"red", "critical":"red"}
                    c2.markdown(f"**Risk:** :{cols_map.get(response.risk_level, 'gray')}[{response.risk_level.upper()}]")
                    
                    with st.expander("Details", expanded=True):
                        st.markdown(f"**Legal Basis:** {response.legal_basis}")
                        st.markdown(f"**Analysis:** {response.risk_analysis}")
                    
                    content_str = f"**{response.summary}**\n\n*Source:* {response.legal_basis}"
                else:
                    # Fallback String (Block/Refusal)
                    st.markdown(response)
                    content_str = str(response)

                st.session_state.messages.append({"role": "assistant", "content": content_str})
                
                # Auto-Log
                qid = str(hash(prompt))
                st.session_state.governance_vault[qid] = {
                    "query": prompt,
                    "domain": st.session_state["domain"],
                    "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
                    "response": content_str[:50] + "..."
                }

# --- PAGE: FDA SEARCH (DIRECT) ---
elif selected == "FDA Search":
    st.header("🔎 FDA Lawsuit Search (Tavily)")
    st.markdown("Search specifically for recent court cases and legal precedents.")
    
    tavily_q = st.text_input("Enter keywords (e.g. 'medical device recall lawsuit 2024')")
    if st.button("Search External DB", type="primary"):
        from agent.tavily_search import LawsuitSearcher
        ts = LawsuitSearcher()
        with st.spinner("Searching global legal databases..."):
            res = ts.search_lawsuits(tavily_q)
            st.markdown(res)

# --- PAGE: AUDIT LOGS ---
elif selected == "Audit Logs":
    st.header("📜 Governance Vault")
    if st.session_state.governance_vault:
        df = pd.DataFrame(st.session_state.governance_vault.values())
        st.dataframe(df, use_container_width=True)
    else:
        st.info("No logs found.")

# --- PAGE: ACCOUNTS ---
elif selected == "Accounts":
    st.header("👤 User Configuration")
    st.text_input("Username", value=st.session_state.get("user_name", "Admin"))
    st.text_input("Role", value=st.session_state.get("user_role", "Admin"), disabled=True)
    st.toggle("Enable Dark Mode", value=True)
    st.button("Save Preferences")

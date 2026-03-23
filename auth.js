(function () {
  const CLIENT_ID = "474329839880-es032muok9kcnivatur7b8iech7lpbee.apps.googleusercontent.com";
  const ALLOWED_DOMAIN = "eldercarehc.com";

  // Inject Google GSI script
  const gsiScript = document.createElement("script");
  gsiScript.src = "https://accounts.google.com/gsi/client";
  gsiScript.async = true;
  gsiScript.defer = true;
  document.head.appendChild(gsiScript);

  // Inject login overlay styles
  const style = document.createElement("style");
  style.textContent = `
    #echc-login-overlay {
      position: fixed; inset: 0; z-index: 99999;
      background: #0f2236;
      display: flex; align-items: center; justify-content: center;
      font-family: 'DM Sans', Georgia, sans-serif;
    }
    #echc-login-overlay::before {
      content: '';
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse 60% 50% at 20% 80%, rgba(26,107,114,0.35) 0%, transparent 60%),
        radial-gradient(ellipse 50% 40% at 80% 20%, rgba(200,169,110,0.15) 0%, transparent 55%);
      pointer-events: none;
    }
    .echc-card {
      position: relative;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 52px;
      width: 400px;
      text-align: center;
    }
    .echc-card h2 {
      color: white;
      font-size: 1.7rem;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }
    .echc-card p {
      color: rgba(255,255,255,0.45);
      font-size: 0.875rem;
      margin-bottom: 36px;
      line-height: 1.6;
    }
    .echc-divider {
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 24px;
    }
    .echc-divider hr { flex: 1; border: none; border-top: 1px solid rgba(255,255,255,0.1); }
    .echc-divider span { color: rgba(255,255,255,0.25); font-size: 0.72rem; }
    .echc-btn-wrap { display: flex; justify-content: center; }
    #echc-denied {
      display: none;
      margin-top: 20px;
      background: rgba(220,38,38,0.15);
      border: 1px solid rgba(220,38,38,0.3);
      border-radius: 10px;
      padding: 14px 16px;
      color: #fca5a5;
      font-size: 0.82rem;
      line-height: 1.5;
      text-align: left;
    }
    .echc-footer {
      margin-top: 32px;
      font-size: 0.72rem;
      color: rgba(255,255,255,0.2);
    }
  `;
  document.head.appendChild(style);

  // Check session
  const session = sessionStorage.getItem("echc_auth");
  if (session === "ok") return; // Already authenticated this session

  // Block page content until auth
  document.documentElement.style.overflow = "hidden";

  // Build overlay
  const overlay = document.createElement("div");
  overlay.id = "echc-login-overlay";
  overlay.innerHTML = `
    <div class="echc-card">
      <h2>ECHC Tools</h2>
      <p>Sign in with your <strong style="color:rgba(255,255,255,0.7)">@eldercarehc.com</strong> Google account to continue.</p>
      <div class="echc-divider">
        <hr><span>SIGN IN WITH GOOGLE</span><hr>
      </div>
      <div class="echc-btn-wrap">
        <div id="echc-g-btn"></div>
      </div>
      <div id="echc-denied"></div>
      <div class="echc-footer">Elder Care Home Care &nbsp;·&nbsp; Internal Use Only</div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Init Google Sign-In once GSI loads
  gsiScript.onload = function () {
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
    });
    window.google.accounts.id.renderButton(
      document.getElementById("echc-g-btn"),
      { theme: "outline", size: "large", text: "signin_with" }
    );
  };

  function handleCredentialResponse(response) {
    const payload = JSON.parse(atob(response.credential.split(".")[1]));
    const email   = payload.email || "";
    const domain  = email.split("@")[1] || "";

    if (domain === ALLOWED_DOMAIN) {
      sessionStorage.setItem("echc_auth", "ok");
      document.documentElement.style.overflow = "";
      overlay.remove();
    } else {
      const denied = document.getElementById("echc-denied");
      denied.style.display = "block";
      denied.innerHTML = `⛔ <strong>Access denied.</strong><br>${email} is not an authorized @${ALLOWED_DOMAIN} account.`;
    }
  }
})();

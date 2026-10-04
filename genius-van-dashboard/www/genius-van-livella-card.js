/**
 * Genius Van Livella Pro Card (v1.0.0)
 * Plancia Assetto Sosta e Guida ai Cunei per Camper & Van
 * Stile Cyber Dark Glassmorphic coerente con Cockpit Pro
 */

const LIVELLA_CARD_VERSION = '1.0.0';

class GeniusVanLivellaCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._domCreated = false;
  }

  setConfig(config) {
    this._config = Object.assign({
      title: 'LIVELLA ASSETTO SOSTA',
      subtitle: 'Guida al posizionamento cunei e assetto in bolla',

      // Entità ESPHome livellavan
      fl_wedge_entity: 'sensor.livella_van_altezza_cuneo_fl',
      fr_wedge_entity: 'sensor.livella_van_altezza_cuneo_fr',
      rl_wedge_entity: 'sensor.livella_van_altezza_cuneo_rl',
      rr_wedge_entity: 'sensor.livella_van_altezza_cuneo_rr',

      pitch_entity: 'sensor.livella_van_van_pitch',
      roll_entity: 'sensor.livella_van_van_roll',
      pitch_cm_entity: 'sensor.livella_van_van_livella_cm_longitudinale',
      roll_cm_entity: 'sensor.livella_van_van_livella_cm_trasversale',
      level_status_entity: 'binary_sensor.livella_van_van_livellato',
      calibrate_button_entity: 'button.livella_van_calibra_piano_bolla'
    }, config);
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._domCreated) {
      this._buildDOM();
    }
    this._updateValues();
  }

  _buildDOM() {
    this._domCreated = true;
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
          --bg-card: linear-gradient(135deg, rgba(20, 26, 35, 0.92) 0%, rgba(12, 16, 22, 0.98) 100%);
          --border-color: rgba(255, 255, 255, 0.08);
          --accent-cyan: #00e5ff;
          --accent-lime: #00e676;
          --accent-amber: #f59e0b;
          --accent-red: #ef4444;
          --text-main: #f8fafc;
          --text-muted: #94a3b8;
          color: var(--text-main);
          box-sizing: border-box;
        }

        * {
          box-sizing: border-box;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .container {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), inset 0 0 40px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(16px);
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .header-title {
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .header-title span {
          color: var(--accent-cyan);
        }
        .header-sub {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-top: 3px;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          border: 1px solid transparent;
          transition: all 0.3s ease;
        }
        .status-badge.in-bolla {
          background: rgba(0, 230, 118, 0.15);
          color: var(--accent-lime);
          border-color: rgba(0, 230, 118, 0.4);
          box-shadow: 0 0 16px rgba(0, 230, 118, 0.25);
        }
        .status-badge.da-livellare {
          background: rgba(245, 158, 11, 0.15);
          color: var(--accent-amber);
          border-color: rgba(245, 158, 11, 0.4);
          box-shadow: 0 0 16px rgba(245, 158, 11, 0.2);
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
          box-shadow: 0 0 8px currentColor;
        }

        /* Main Grid */
        .main-grid {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 28px;
          align-items: center;
        }

        @media (max-width: 860px) {
          .main-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .container {
            padding: 16px;
          }
        }

        /* Left Side: Bullseye Target */
        .target-card {
          background: rgba(13, 30, 44, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .target-box {
          position: relative;
          width: 220px;
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .target-svg {
          position: absolute;
          top: 0;
          left: 0;
          width: 220px;
          height: 220px;
        }

        /* Floating Bubble */
        .target-bubble {
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #ffffff 0%, #00e5ff 45%, #007799 100%);
          box-shadow: 0 0 18px rgba(0, 229, 255, 0.7), inset 0 0 6px rgba(255, 255, 255, 0.8);
          transform: translate(-50%, -50%);
          transition: left 0.15s ease-out, top 0.15s ease-out, background 0.3s ease;
          pointer-events: none;
          z-index: 5;
        }
        .target-bubble.in-bolla {
          background: radial-gradient(circle at 35% 35%, #ffffff 0%, #00e676 45%, #008844 100%);
          box-shadow: 0 0 22px rgba(0, 230, 118, 0.9), inset 0 0 6px rgba(255, 255, 255, 0.8);
        }

        .target-readouts {
          display: flex;
          justify-content: space-around;
          width: 100%;
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .readout-item {
          text-align: center;
        }
        .readout-title {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .readout-val {
          font-size: 1.25rem;
          font-weight: 800;
          color: #ffffff;
          margin-top: 2px;
        }
        .readout-val small {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-left: 2px;
        }

        /* Right Side: Van Vehicle 4-Wheel Ramps Layout */
        .van-ramps-card {
          background: rgba(13, 30, 44, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .van-diagram {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 140px 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 16px 12px;
          align-items: center;
          margin-bottom: 20px;
        }

        @media (max-width: 500px) {
          .van-diagram {
            grid-template-columns: 1fr 90px 1fr;
          }
        }

        /* Center Van Silhouette */
        .van-center-art {
          grid-column: 2;
          grid-row: 1 / span 2;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .van-svg {
          width: 100%;
          max-width: 110px;
          height: auto;
          filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.6));
        }

        /* Wheel Ramp Tiles */
        .wheel-tile {
          background: rgba(20, 26, 35, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 12px 14px;
          transition: all 0.25s ease;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 84px;
        }
        .wheel-tile.fl { grid-column: 1; grid-row: 1; }
        .wheel-tile.fr { grid-column: 3; grid-row: 1; }
        .wheel-tile.rl { grid-column: 1; grid-row: 2; }
        .wheel-tile.rr { grid-column: 3; grid-row: 2; }

        .wheel-tile.ground {
          border-color: rgba(0, 230, 118, 0.35);
          background: linear-gradient(135deg, rgba(12, 38, 25, 0.85) 0%, rgba(10, 22, 18, 0.95) 100%);
        }
        .wheel-tile.lift-low {
          border-color: rgba(0, 229, 255, 0.35);
        }
        .wheel-tile.lift-high {
          border-color: rgba(245, 158, 11, 0.5);
          background: linear-gradient(135deg, rgba(45, 30, 10, 0.85) 0%, rgba(20, 16, 10, 0.95) 100%);
        }

        .wheel-head {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .wheel-head .pos {
          color: #ffffff;
        }
        .wheel-val-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-top: 4px;
        }
        .wheel-val {
          font-size: 1.7rem;
          font-weight: 800;
          line-height: 1;
          color: #ffffff;
        }
        .wheel-unit {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
        }
        .wheel-status {
          font-size: 0.72rem;
          font-weight: 700;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .wheel-status.ground { color: var(--accent-lime); }
        .wheel-status.lift { color: var(--accent-amber); }

        /* Bottom Action Bar */
        .bottom-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          flex-wrap: wrap;
          gap: 16px;
        }
        .advice-box {
          font-size: 0.88rem;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .advice-box strong {
          color: var(--accent-cyan);
        }

        .calib-btn {
          background: rgba(0, 229, 255, 0.12);
          border: 1px solid rgba(0, 229, 255, 0.35);
          color: var(--accent-cyan);
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .calib-btn:hover {
          background: rgba(0, 229, 255, 0.22);
          border-color: var(--accent-cyan);
          box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
          transform: translateY(-1px);
        }
        .calib-btn:active {
          transform: translateY(1px);
        }
      </style>

      <div class="container">
        <!-- HEADER -->
        <div class="header">
          <div>
            <div class="header-title">
              <span>GENIUS</span> LIVELLA PRO
            </div>
            <div class="header-sub">${this._config.subtitle}</div>
          </div>
          <div id="status-badge" class="status-badge da-livellare">
            <div class="status-dot"></div>
            <span id="status-badge-text">CALCOLO IN CORSO</span>
          </div>
        </div>

        <!-- MAIN CONTENT GRID -->
        <div class="main-grid">
          <!-- LEFT: 2D BULLSEYE TARGET -->
          <div class="target-card">
            <div class="target-box">
              <svg class="target-svg" viewBox="0 0 220 220">
                <!-- Concentric Rings -->
                <circle cx="110" cy="110" r="102" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" fill="#06121d" />
                <circle cx="110" cy="110" r="75" stroke="rgba(0, 229, 255, 0.2)" stroke-width="1.5" stroke-dasharray="4,4" fill="none" />
                <circle cx="110" cy="110" r="45" stroke="rgba(0, 229, 255, 0.35)" stroke-width="1.5" fill="none" />
                <!-- In-Bolla Center Ring (Target 0.5 deg) -->
                <circle id="target-center-ring" cx="110" cy="110" r="20" stroke="rgba(0, 230, 118, 0.5)" stroke-width="2" fill="rgba(0, 230, 118, 0.08)" />

                <!-- Crosshair lines -->
                <line x1="110" y1="12" x2="110" y2="208" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
                <line x1="12" y1="110" x2="208" y2="110" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />

                <!-- Cardinal/Orientation Marks -->
                <text x="110" y="24" text-anchor="middle" font-size="11" font-weight="800" fill="#94a3b8">AVANTI</text>
                <text x="110" y="202" text-anchor="middle" font-size="11" font-weight="800" fill="#94a3b8">DIETRO</text>
                <text x="24" y="114" text-anchor="middle" font-size="11" font-weight="800" fill="#94a3b8">SX</text>
                <text x="196" y="114" text-anchor="middle" font-size="11" font-weight="800" fill="#94a3b8">DX</text>
              </svg>

              <!-- Floating Bubble -->
              <div id="target-bubble" class="target-bubble" style="left: 110px; top: 110px;"></div>
            </div>

            <!-- Readouts below target -->
            <div class="target-readouts">
              <div class="readout-item">
                <div class="readout-title">Rollio (Trasv.)</div>
                <div class="readout-val"><span id="val-roll-deg">--</span><small>°</small> <small>(<span id="val-roll-cm">--</span> cm)</small></div>
              </div>
              <div class="readout-item">
                <div class="readout-title">Beccheggio (Long.)</div>
                <div class="readout-val"><span id="val-pitch-deg">--</span><small>°</small> <small>(<span id="val-pitch-cm">--</span> cm)</small></div>
              </div>
            </div>
          </div>

          <!-- RIGHT: VAN VEHICLE 4-WHEEL RAMPS DIAGRAM -->
          <div class="van-ramps-card">
            <div class="van-diagram">
              <!-- ANTERIORE SX -->
              <div class="wheel-tile fl" id="tile-wheel-fl">
                <div class="wheel-head">
                  <span class="pos">ANT SX</span>
                  <span>RUOTA 1</span>
                </div>
                <div class="wheel-val-row">
                  <span class="wheel-val" id="val-wedge-fl">--</span>
                  <span class="wheel-unit">cm</span>
                </div>
                <div class="wheel-status" id="status-wheel-fl">Calcolo...</div>
              </div>

              <!-- ANTERIORE DX -->
              <div class="wheel-tile fr" id="tile-wheel-fr">
                <div class="wheel-head">
                  <span class="pos">ANT DX</span>
                  <span>RUOTA 2</span>
                </div>
                <div class="wheel-val-row">
                  <span class="wheel-val" id="val-wedge-fr">--</span>
                  <span class="wheel-unit">cm</span>
                </div>
                <div class="wheel-status" id="status-wheel-fr">Calcolo...</div>
              </div>

              <!-- CENTER: TOP-DOWN VAN SILHOUETTE -->
              <div class="van-center-art">
                <svg class="van-svg" viewBox="0 0 100 180">
                  <!-- Van Body Outline -->
                  <rect x="18" y="24" width="64" height="142" rx="14" fill="#0d2436" stroke="#00e5ff" stroke-width="2.5" />
                  <!-- Cab Windshield Curved -->
                  <path d="M26 44 C26 32, 38 28, 50 28 C62 28, 74 32, 74 44 L70 56 C70 58, 66 60, 50 60 C34 60, 30 58, 30 56 Z" 
                        fill="rgba(0, 229, 255, 0.35)" stroke="#00e5ff" stroke-width="1.5" />
                  <!-- Roof Skylight / MaxxFan -->
                  <rect x="36" y="80" width="28" height="28" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(0, 229, 255, 0.4)" stroke-width="1.5" />
                  <circle cx="50" cy="94" r="8" fill="none" stroke="#00e5ff" stroke-width="1.2" stroke-dasharray="2,3" />
                  <!-- Forward Direction Arrow -->
                  <path d="M50 16 L50 24 M44 20 L50 14 L56 20" stroke="#00e676" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                  <!-- 4 Wheels Indicators on Sides -->
                  <rect x="8" y="38" width="8" height="22" rx="3" fill="#334155" stroke="#64748b" stroke-width="1.2" />
                  <rect x="84" y="38" width="8" height="22" rx="3" fill="#334155" stroke="#64748b" stroke-width="1.2" />
                  <rect x="8" y="126" width="8" height="22" rx="3" fill="#334155" stroke="#64748b" stroke-width="1.2" />
                  <rect x="84" y="126" width="8" height="22" rx="3" fill="#334155" stroke="#64748b" stroke-width="1.2" />
                </svg>
              </div>

              <!-- POSTERIORE SX -->
              <div class="wheel-tile rl" id="tile-wheel-rl">
                <div class="wheel-head">
                  <span class="pos">POST SX</span>
                  <span>RUOTA 3</span>
                </div>
                <div class="wheel-val-row">
                  <span class="wheel-val" id="val-wedge-rl">--</span>
                  <span class="wheel-unit">cm</span>
                </div>
                <div class="wheel-status" id="status-wheel-rl">Calcolo...</div>
              </div>

              <!-- POSTERIORE DX -->
              <div class="wheel-tile rr" id="tile-wheel-rr">
                <div class="wheel-head">
                  <span class="pos">POST DX</span>
                  <span>RUOTA 4</span>
                </div>
                <div class="wheel-val-row">
                  <span class="wheel-val" id="val-wedge-rr">--</span>
                  <span class="wheel-unit">cm</span>
                </div>
                <div class="wheel-status" id="status-wheel-rr">Calcolo...</div>
              </div>
            </div>
          </div>
        </div>

        <!-- BOTTOM ACTION & ADVICE BAR -->
        <div class="bottom-bar">
          <div class="advice-box" id="advice-box">
            <span>💡 Consiglio Cunei: <strong id="advice-text">Verifica dislivello</strong></span>
          </div>

          <button id="btn-calibrate" class="calib-btn" title="Azzera e calibra la bolla nella posizione attuale">
            <span>🎯 CALIBRA PIANO ZERO</span>
          </button>
        </div>
      </div>
    `;

    // Event listener for calibration button
    const btnCalib = this.shadowRoot.getElementById('btn-calibrate');
    if (btnCalib) {
      btnCalib.addEventListener('click', () => {
        if (confirm("Vuoi memorizzare la posizione attuale del van come 'PIANO ZERO' (In Bolla)?")) {
          this._hass.callService('button', 'press', {
            entity_id: this._config.calibrate_button_entity
          });
          btnCalib.innerHTML = "<span>✓ ZERO MEMORIZZATO!</span>";
          setTimeout(() => {
            btnCalib.innerHTML = "<span>🎯 CALIBRA PIANO ZERO</span>";
          }, 3500);
        }
      });
    }
  }

  _updateValues() {
    if (!this._domCreated || !this._hass) return;

    // 1. Fetch Wheel Wedges (cm)
    const fl = this._getFloat(this._config.fl_wedge_entity, 0, 1);
    const fr = this._getFloat(this._config.fr_wedge_entity, 0, 1);
    const rl = this._getFloat(this._config.rl_wedge_entity, 0, 1);
    const rr = this._getFloat(this._config.rr_wedge_entity, 0, 1);

    this._updateWheelCard('fl', fl);
    this._updateWheelCard('fr', fr);
    this._updateWheelCard('rl', rl);
    this._updateWheelCard('rr', rr);

    // 2. Fetch Pitch & Roll
    const pitch = this._getFloat(this._config.pitch_entity, 0, 1);
    const roll = this._getFloat(this._config.roll_entity, 0, 1);
    const pitchCm = this._getFloat(this._config.pitch_cm_entity, 0, 1);
    const rollCm = this._getFloat(this._config.roll_cm_entity, 0, 1);

    this._setText('val-roll-deg', (roll > 0 ? '+' : '') + roll.toFixed(1));
    this._setText('val-roll-cm', (rollCm > 0 ? '+' : '') + rollCm.toFixed(1));
    this._setText('val-pitch-deg', (pitch > 0 ? '+' : '') + pitch.toFixed(1));
    this._setText('val-pitch-cm', (pitchCm > 0 ? '+' : '') + pitchCm.toFixed(1));

    // 3. Level Status
    const isLevel = this._getState(this._config.level_status_entity, 'off') === 'on' || 
                    (Math.max(fl, fr, rl, rr) <= 0.8);

    const badge = this.shadowRoot.getElementById('status-badge');
    const badgeText = this.shadowRoot.getElementById('status-badge-text');
    const bubble = this.shadowRoot.getElementById('target-bubble');
    const centerRing = this.shadowRoot.getElementById('target-center-ring');

    if (badge && badgeText) {
      if (isLevel) {
        badge.className = 'status-badge in-bolla';
        badgeText.textContent = '✓ VAN IN BOLLA';
      } else {
        badge.className = 'status-badge da-livellare';
        badgeText.textContent = '▲ DA LIVELLARE';
      }
    }

    // 4. Position Floating Bubble on Target (220x220px box, center is 110, 110)
    // Scale: 1 deg = 16 pixels displacement
    if (bubble) {
      const scale = 16;
      const maxOffset = 88;
      // In a real spirit level, bubble rises to high side (opposite of vehicle tilt angle)
      // roll > 0 means tilted right -> high side is left (-X)
      // pitch > 0 means tilted rear -> high side is front (-Y)
      let dx = -roll * scale;
      let dy = -pitch * scale;

      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxOffset) {
        dx = (dx / dist) * maxOffset;
        dy = (dy / dist) * maxOffset;
      }

      const bubbleLeft = 110 + dx;
      const bubbleTop = 110 + dy;

      bubble.style.left = `${bubbleLeft}px`;
      bubble.style.top = `${bubbleTop}px`;
      bubble.classList.toggle('in-bolla', isLevel);
    }

    if (centerRing) {
      centerRing.setAttribute('stroke', isLevel ? 'var(--accent-lime)' : 'rgba(0, 230, 118, 0.4)');
      centerRing.setAttribute('fill', isLevel ? 'rgba(0, 230, 118, 0.22)' : 'rgba(0, 230, 118, 0.06)');
    }

    // 5. Camper Ramps Advice String
    const adviceText = this.shadowRoot.getElementById('advice-text');
    if (adviceText) {
      if (isLevel) {
        adviceText.innerHTML = `<span style="color: var(--accent-lime);">Perfetto! Il van è perfettamente in piano. Nessun cuneo necessario.</span>`;
      } else {
        const wheels = [
          { name: 'Ant. Sinistra', val: fl },
          { name: 'Ant. Destra', val: fr },
          { name: 'Post. Sinistra', val: rl },
          { name: 'Post. Destra', val: rr }
        ];
        wheels.sort((a, b) => b.val - a.val);
        const topWheel = wheels[0];
        if (topWheel.val > 0) {
          adviceText.innerHTML = `Solleva <strong>${topWheel.name}</strong> con cuneo da <strong>+${topWheel.val.toFixed(1)} cm</strong>`;
        } else {
          adviceText.textContent = "Verifica pendenza del terreno";
        }
      }
    }
  }

  _updateWheelCard(pos, val) {
    const tile = this.shadowRoot.getElementById(`tile-wheel-${pos}`);
    const valEl = this.shadowRoot.getElementById(`val-wedge-${pos}`);
    const statusEl = this.shadowRoot.getElementById(`status-wheel-${pos}`);
    if (!tile || !valEl || !statusEl) return;

    valEl.textContent = val.toFixed(1);

    if (val <= 0.3) {
      tile.className = `wheel-tile ${pos} ground`;
      statusEl.className = 'wheel-status ground';
      statusEl.innerHTML = '● A TERRA (0 cm)';
      valEl.style.color = 'var(--accent-lime)';
    } else if (val >= 3.5) {
      tile.className = `wheel-tile ${pos} lift-high`;
      statusEl.className = 'wheel-status lift';
      statusEl.innerHTML = '▲ CUNEO ALTO';
      valEl.style.color = 'var(--accent-amber)';
    } else {
      tile.className = `wheel-tile ${pos} lift-low`;
      statusEl.className = 'wheel-status lift';
      statusEl.innerHTML = '▲ CUNEO BASSO';
      valEl.style.color = 'var(--accent-cyan)';
    }
  }

  _getFloat(entityId, defaultVal = 0, precision = 1) {
    if (!this._hass || !this._hass.states[entityId]) return defaultVal;
    const v = parseFloat(this._hass.states[entityId].state);
    return isNaN(v) ? defaultVal : parseFloat(v.toFixed(precision));
  }

  _getState(entityId, defaultVal = '--') {
    if (!this._hass || !this._hass.states[entityId]) return defaultVal;
    return this._hass.states[entityId].state;
  }

  _setText(id, text) {
    const el = this.shadowRoot.getElementById(id);
    if (el) el.textContent = text;
  }

  getCardSize() {
    return 5;
  }
}

customElements.define('genius-van-livella-card', GeniusVanLivellaCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'genius-van-livella-card',
  name: 'Genius Van Livella Pro Card',
  description: 'Plancia Assetto Sosta e Guida ai Cunei per Camper & Van'
});
console.info(`%c GENIUS-VAN-LIVELLA-CARD %c v${LIVELLA_CARD_VERSION} `, 'color: #060f18; background: #00e5ff; font-weight: bold;', 'color: #fff; background: #10273a;');

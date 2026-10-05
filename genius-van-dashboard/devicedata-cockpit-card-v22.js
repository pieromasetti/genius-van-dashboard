const CARD_VERSION = '2.9.0';

class DeviceDataCockpitCardV22 extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._currentSlide = 0;
    this._isLocked = false;
    this._slideInterval = 7000;
    this._timer = null;
    this._domCreated = false;
    this._activeModal = null; // 'orion', 'mp_limit', 'mp_mode', 'gpl_calib'
    
    this._touchStartX = 0;
    this._touchEndX = 0;
  }

  setConfig(config) {
    this._config = Object.assign({
      interval: 7,
      title: 'GENIUS COCKPIT',
      
      soc_entity: 'sensor.smartshunt_300a_id_290_charge_2',
      bs_voltage_entity: 'sensor.smartshunt_300a_id_290_dc_bus_voltage_2',
      bm_voltage_entity: 'sensor.smartshunt_300a_id_290_auxiliary_battery_voltage_2',
      current_entity: 'sensor.smartshunt_300a_id_290_dc_bus_current_2',
      power_entity: 'sensor.smartshunt_300a_id_290_power_2',
      time_to_go_entity: 'sensor.autonomia_batteria',
      
      solar_power_entity: 'sensor.smartsolar_charger_mppt_75_15_rev2_id_291_pv_yield_power_2',
      solar_voltage_entity: 'sensor.smartsolar_charger_mppt_75_15_rev2_id_291_pv_bus_voltage_2',
      solar_current_entity: 'sensor.smartsolar_charger_mppt_75_15_rev2_id_291_dc_battery_bus_current_2',
      solar_yield_today_entity: 'sensor.smartsolar_charger_mppt_75_15_rev2_id_291_yield_today_2',
      solar_state_entity: 'sensor.smartsolar_charger_mppt_75_15_rev2_id_291_state_2',
      orion_current_limit_entity: 'number.orion_xs_hq2420cckuw_charge_current_limit',
      orion_switch_entity: 'switch.orion_xs_hq2420cckuw_2',

      multiplus_mode_entity: 'select.multiplus_12_2000_80_32_id_292_2',
      multiplus_power_entity: 'sensor.multiplus_12_2000_80_32_id_292_output_power_l1_2',
      multiplus_voltage_entity: 'sensor.multiplus_12_2000_80_32_id_292_output_voltage_l1_2',
      multiplus_limit_entity: 'number.multiplus_12_2000_80_32_id_292_current_limit_2',
      multiplus_powerassist_entity: 'switch.multiplus_12_2000_80_32_id_292_0_powerassist_enabled_2',

      pitch_cm_entity: 'sensor.livella_van_van_livella_cm_longitudinale',
      roll_cm_entity: 'sensor.livella_van_van_livella_cm_trasversale',
      pitch_entity: 'sensor.livella_van_van_pitch',
      roll_entity: 'sensor.livella_van_van_roll',
      level_status_entity: 'binary_sensor.livella_van_van_livellato',
      altitude_entity: 'sensor.altitudine_gps',
      heading_entity: 'sensor.rotta_gps',

      gpl_pct_entity: 'sensor.gpl_percentuale_calcolata',
      gpl_pct_mem_entity: 'sensor.gpl_percentuale_memoria',
      gpl_weight_entity: 'sensor.gpl_peso_netto',
      gpl_weight_mem_entity: 'sensor.gpl_peso_netto_memoria',
      gpl_total_weight_entity: 'sensor.peso_bombola_gpl_memoria',
      gpl_time_entity: 'sensor.gpl_ultima_pesata',
      gpl_tara_entity: 'input_number.tara_bombola_gpl',
      gpl_capacity_entity: 'input_number.capacita_bombola_gpl',

      temp_in_entity: 'sensor.interno_van_temperature',
      temp_out_entity: 'sensor.temperatura_esterna_temperature',
      temp_frigo_entity: 'sensor.frigo_temperature',
      temp_freezer_entity: 'sensor.freezer_temperature',
      truma_climate_entity: 'climate.truma_inetx_ffb356',

      fuel_entity: 'sensor.gy407se_fuel_level',
      range_entity: 'sensor.gy407se_range_liquid',
      adblue_entity: 'sensor.gy407se_adblue_level',
      odometer_entity: 'sensor.gy407se_odometer',
      lock_entity: 'lock.gy407se_lock',
      windows_entity: 'binary_sensor.gy407se_windows_closed',
      park_brake_entity: 'binary_sensor.gy407se_park_brake_status',
      tire_fl_entity: 'sensor.gy407se_tire_pressure_front_left',
      tire_fr_entity: 'sensor.gy407se_tire_pressure_front_right',
      tire_rl_entity: 'sensor.gy407se_tire_pressure_rear_left',
      tire_rr_entity: 'sensor.gy407se_tire_pressure_rear_right',
      tire_warn_entity: 'binary_sensor.gy407se_tire_warning',
      brake_fluid_entity: 'binary_sensor.gy407se_low_brake_fluid_warning',
      coolant_entity: 'binary_sensor.gy407se_low_coolant_level_warning',
      diesel_sensor: 'sensor.miglior_prezzo_diesel_van',
      radar_switch_entity: 'input_boolean.radar_diesel_attivo'
    }, config);

    this._slideInterval = (this._config.interval || 7) * 1000;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._domCreated) {
      this._buildDOM();
    }
    this._updateValues();
  }

  connectedCallback() {
    this._startTimer();
  }

  disconnectedCallback() {
    this._stopTimer();
  }

  _startTimer() {
    this._stopTimer();
    this._timer = setInterval(() => {
      if (!this._isLocked && !this._activeModal) {
        this._currentSlide = (this._currentSlide + 1) % 7;
        this._applySlide();
      }
    }, this._slideInterval);
  }

  _stopTimer() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  _toggleLock() {
    this._isLocked = !this._isLocked;
    const lockBtn = this.shadowRoot.getElementById('lock-toggle');
    if (lockBtn) {
      lockBtn.innerHTML = `<span>${this._isLocked ? '🔒 BLOCCATO' : '▶ AUTO-CYCLE'}</span>`;
      lockBtn.style.background = this._isLocked ? 'rgba(239, 68, 68, 0.18)' : 'rgba(72, 214, 255, 0.12)';
      lockBtn.style.borderColor = this._isLocked ? 'var(--accent-red)' : 'var(--accent-cyan)';
      lockBtn.style.color = this._isLocked ? '#fca5a5' : 'var(--accent-cyan)';
    }
    if (!this._isLocked) {
      this._startTimer();
    }
  }

  _setSlide(index) {
    this._currentSlide = index;
    this._applySlide();
    if (!this._isLocked) {
      this._startTimer();
    }
  }

  _applySlide() {
    const container = this.shadowRoot.getElementById('slides-wrapper');
    if (container) {
      container.style.transform = `translateX(-${this._currentSlide * 100}%)`;
    }
    const dots = this.shadowRoot.querySelectorAll('.dot-btn');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this._currentSlide);
      if (idx === this._currentSlide) {
        dot.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  }

  _openCustomModal(type) {
    this._activeModal = type;
    const modal = this.shadowRoot.getElementById('custom-modal');
    const content = this.shadowRoot.getElementById('modal-dynamic-content');
    if (!modal || !content) return;

    if (type === 'orion') {
      const curVal = this._getFloat(this._config.orion_current_limit_entity, 30, 0);
      const isSwitchOn = this._getState(this._config.orion_switch_entity, 'off') === 'on';
      content.innerHTML = `
        <div class="modal-title">⚙️ REGOLAZIONE ORION XS</div>
        <div class="modal-subtitle">Alternatore Carica Servizi</div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding: 12px; background: rgba(255,255,255,0.04); border-radius: 12px;">
          <span style="font-weight: 700; font-size: 0.9rem;">Stato Alternatore</span>
          <button id="modal-orion-toggle" class="modal-toggle-btn ${isSwitchOn ? 'on' : 'off'}">
            ${isSwitchOn ? '⚡ ATTIVO' : '⭕ DISATTIVO'}
          </button>
        </div>

        <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 8px;">
          LIMITE CORRENTE (AMPERE):
        </div>

        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">
          <input type="range" id="orion-slider" min="0" max="50" step="1" value="${curVal}" class="cyber-slider" style="flex: 1;" />
          <input type="number" id="orion-num" min="0" max="50" step="1" value="${curVal}" class="cyber-num-input" />
        </div>

        <div style="display: flex; gap: 8px; justify-content: space-between; margin-bottom: 24px;">
          <button class="preset-btn" data-val="10">10 A</button>
          <button class="preset-btn" data-val="20">20 A</button>
          <button class="preset-btn" data-val="30">30 A</button>
          <button class="preset-btn" data-val="40">40 A</button>
          <button class="preset-btn" data-val="50">50 A</button>
        </div>

        <div style="display: flex; gap: 12px;">
          <button id="modal-apply-btn" class="modal-action-btn primary" style="flex: 1;">APPLICA</button>
          <button id="modal-close-btn" class="modal-action-btn secondary">CHIUDI</button>
        </div>
      `;

      const slider = content.querySelector('#orion-slider');
      const numInput = content.querySelector('#orion-num');
      slider.addEventListener('input', () => { numInput.value = slider.value; });
      numInput.addEventListener('input', () => { slider.value = numInput.value; });

      content.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const v = btn.getAttribute('data-val');
          slider.value = v;
          numInput.value = v;
        });
      });

      content.querySelector('#modal-orion-toggle').addEventListener('click', () => {
        this._hass.callService('switch', 'toggle', { entity_id: this._config.orion_switch_entity });
        setTimeout(() => this._closeCustomModal(), 300);
      });

      content.querySelector('#modal-apply-btn').addEventListener('click', () => {
        const val = parseFloat(numInput.value);
        if (!isNaN(val)) {
          this._hass.callService('number', 'set_value', {
            entity_id: this._config.orion_current_limit_entity,
            value: val
          });
        }
        this._closeCustomModal();
      });

      content.querySelector('#modal-close-btn').addEventListener('click', () => {
        this._closeCustomModal();
      });

    } else if (type === 'mp_limit') {
      const curLimit = this._getFloat(this._config.multiplus_limit_entity, 16, 1);
      content.innerHTML = `
        <div class="modal-title">🔌 LIMITE COLONNINA 230V</div>
        <div class="modal-subtitle">MultiPlus 12/2000 AC Current Limit</div>

        <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 8px;">
          AMPERE PRELEVABILI DALLA PRESA:
        </div>

        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">
          <input type="range" id="mp-slider" min="1" max="16" step="0.5" value="${curLimit}" class="cyber-slider" style="flex: 1;" />
          <input type="number" id="mp-num" min="1" max="16" step="0.5" value="${curLimit}" class="cyber-num-input" />
        </div>

        <div style="display: flex; gap: 8px; justify-content: space-between; margin-bottom: 24px;">
          <button class="preset-btn" data-val="3">3 A</button>
          <button class="preset-btn" data-val="4">4 A</button>
          <button class="preset-btn" data-val="6">6 A</button>
          <button class="preset-btn" data-val="10">10 A</button>
          <button class="preset-btn" data-val="16">16 A</button>
        </div>

        <div style="display: flex; gap: 12px;">
          <button id="modal-apply-btn" class="modal-action-btn primary" style="flex: 1;">APPLICA</button>
          <button id="modal-close-btn" class="modal-action-btn secondary">CHIUDI</button>
        </div>
      `;

      const slider = content.querySelector('#mp-slider');
      const numInput = content.querySelector('#mp-num');
      slider.addEventListener('input', () => { numInput.value = slider.value; });
      numInput.addEventListener('input', () => { slider.value = numInput.value; });

      content.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const v = btn.getAttribute('data-val');
          slider.value = v;
          numInput.value = v;
        });
      });

      content.querySelector('#modal-apply-btn').addEventListener('click', () => {
        const val = parseFloat(numInput.value);
        if (!isNaN(val)) {
          this._hass.callService('number', 'set_value', {
            entity_id: this._config.multiplus_limit_entity,
            value: val
          });
        }
        this._closeCustomModal();
      });

      content.querySelector('#modal-close-btn').addEventListener('click', () => {
        this._closeCustomModal();
      });

    } else if (type === 'mp_mode') {
      const curMode = this._getState(this._config.multiplus_mode_entity, 'off').toLowerCase();
      content.innerHTML = `
        <div class="modal-title">⚡ COMANDI MULTIPLUS</div>
        <div class="modal-subtitle">Seleziona la Modalità Operativa</div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
          <button class="mode-select-btn ${curMode === 'on' ? 'active' : ''}" data-mode="on">
            <span style="font-size: 1.5rem;">⚡</span>
            <strong>ON</strong>
            <small>Inverter + Carica</small>
          </button>
          <button class="mode-select-btn ${curMode === 'charger_only' ? 'active' : ''}" data-mode="charger_only">
            <span style="font-size: 1.5rem;">🔌</span>
            <strong>CHARGER ONLY</strong>
            <small>Solo Caricabatterie</small>
          </button>
          <button class="mode-select-btn ${curMode === 'inverter_only' ? 'active' : ''}" data-mode="inverter_only">
            <span style="font-size: 1.5rem;">🔋</span>
            <strong>INVERTER ONLY</strong>
            <small>Solo Inverter 230V</small>
          </button>
          <button class="mode-select-btn ${curMode === 'off' ? 'active' : ''}" data-mode="off">
            <span style="font-size: 1.5rem;">⭕</span>
            <strong>OFF</strong>
            <small>Spento Completo</small>
          </button>
        </div>

        <div style="display: flex; justify-content: flex-end;">
          <button id="modal-close-btn" class="modal-action-btn secondary" style="width: 100%;">CHIUDI</button>
        </div>
      `;

      content.querySelectorAll('.mode-select-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const mode = btn.getAttribute('data-mode');
          this._hass.callService('select', 'select_option', {
            entity_id: this._config.multiplus_mode_entity,
            option: mode
          });
          setTimeout(() => this._closeCustomModal(), 350);
        });
      });

      content.querySelector('#modal-close-btn').addEventListener('click', () => {
        this._closeCustomModal();
      });

    } else if (type === 'diesel_settings') {
      const isRadarOn = this._getState(this._config.radar_switch_entity || 'input_boolean.radar_diesel_attivo', 'off') === 'on';
      const curRadius = this._getFloat(this._config.diesel_radius_entity || 'input_number.raggio_ricerca_diesel', 10, 0);

      content.innerHTML = `
        <div class="modal-title">⛽ RADAR DIESEL & RAGGIO</div>
        <div class="modal-subtitle">Controllo Prezzi Carburante & Avvisi</div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding: 12px; background: rgba(255,255,255,0.04); border-radius: 12px;">
          <div>
            <div style="font-weight: 700; font-size: 0.95rem;">Radar In Viaggio</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Avvisi automatici ogni 30m lungo il percorso</div>
          </div>
          <button id="modal-diesel-radar-toggle" class="modal-toggle-btn ${isRadarOn ? 'on' : 'off'}">
            ${isRadarOn ? '⚡ ATTIVO' : '⭕ DISATTIVO'}
          </button>
        </div>

        <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 8px;">
          RAGGIO DI RICERCA (KM):
        </div>

        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">
          <input type="range" id="diesel-slider" min="5" max="100" step="5" value="${curRadius}" class="cyber-slider" style="flex: 1;" />
          <input type="number" id="diesel-num" min="5" max="100" step="5" value="${curRadius}" class="cyber-num-input" />
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 24px;">
          <button class="preset-btn" data-val="5">5 km</button>
          <button class="preset-btn" data-val="10">10 km</button>
          <button class="preset-btn" data-val="15">15 km</button>
          <button class="preset-btn" data-val="20">20 km</button>
          <button class="preset-btn" data-val="30">30 km</button>
          <button class="preset-btn" data-val="50">50 km</button>
          <button class="preset-btn" data-val="100" style="grid-column: span 2;">100 km</button>
        </div>

        <div style="display: flex; gap: 12px;">
          <button id="modal-diesel-search-btn" class="modal-action-btn primary" style="flex: 1.5; background: var(--accent-lime); color: #060f18; font-weight: 800;">
            🔍 CERCA ORA SUL POSTO
          </button>
          <button id="modal-diesel-close-btn" class="modal-action-btn secondary" style="flex: 1;">CHIUDI</button>
        </div>
      `;

      const slider = content.querySelector('#diesel-slider');
      const numInput = content.querySelector('#diesel-num');
      slider.addEventListener('input', () => { numInput.value = slider.value; });
      numInput.addEventListener('input', () => { slider.value = numInput.value; });

      content.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const v = btn.getAttribute('data-val');
          slider.value = v;
          numInput.value = v;
          this._hass.callService('input_number', 'set_value', {
            entity_id: this._config.diesel_radius_entity || 'input_number.raggio_ricerca_diesel',
            value: parseFloat(v)
          });
        });
      });

      content.querySelector('#modal-diesel-radar-toggle').addEventListener('click', () => {
        this._hass.callService('input_boolean', 'toggle', {
          entity_id: this._config.radar_switch_entity || 'input_boolean.radar_diesel_attivo'
        });
        setTimeout(() => this._closeCustomModal(), 300);
      });

      const searchBtn = content.querySelector('#modal-diesel-search-btn');
      searchBtn.addEventListener('click', () => {
        const val = parseFloat(numInput.value);
        if (!isNaN(val)) {
          this._hass.callService('input_number', 'set_value', {
            entity_id: this._config.diesel_radius_entity || 'input_number.raggio_ricerca_diesel',
            value: val
          });
        }
        searchBtn.textContent = '⏳ Ricerca in corso...';
        searchBtn.disabled = true;
        this._hass.callService('homeassistant', 'update_entity', {
          entity_id: this._config.diesel_sensor || 'sensor.miglior_prezzo_diesel_van'
        });
        setTimeout(() => {
          this._closeCustomModal();
        }, 1500);
      });

      content.querySelector('#modal-diesel-close-btn').addEventListener('click', () => {
        const val = parseFloat(numInput.value);
        if (!isNaN(val) && val !== curRadius) {
          this._hass.callService('input_number', 'set_value', {
            entity_id: this._config.diesel_radius_entity || 'input_number.raggio_ricerca_diesel',
            value: val
          });
        }
        this._closeCustomModal();
      });

    } else if (type === 'gpl_calib') {
      const curTara = this._getFloat(this._config.gpl_tara_entity, 3.7, 1);
      const curCap = this._getFloat(this._config.gpl_capacity_entity, 5.0, 1);
      const pesoTot = this._getFloat(this._config.gpl_total_weight_entity, 0, 2);
      const pesoNet = this._getFloat(this._config.gpl_weight_entity, 0, 2);

      content.innerHTML = `
        <div class="modal-title">⚖️ CALIBRAZIONE BOMBOLA GPL</div>
        <div class="modal-subtitle">Imposta Tara e Capacità Bombola Gas</div>

        <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(255,255,255,0.04); border-radius: 12px; margin-bottom: 16px; font-size: 0.85rem;">
          <div>Peso Lordo Bilancia: <strong style="color: var(--accent-cyan);">${pesoTot} kg</strong></div>
          <div>Gas Netto Calcolato: <strong style="color: var(--accent-lime);">${pesoNet} kg</strong></div>
        </div>

        <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); margin-bottom: 6px;">
          TARA BOMBOLA VUOTA (KG):
        </div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
          <input type="range" id="tara-slider" min="1.0" max="15.0" step="0.1" value="${curTara}" class="cyber-slider" style="flex: 1;" />
          <input type="number" id="tara-num" min="1.0" max="15.0" step="0.1" value="${curTara}" class="cyber-num-input" />
        </div>

        <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); margin-bottom: 6px;">
          CAPACITÀ NOMINALE GAS (KG):
        </div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <input type="range" id="cap-slider" min="2.0" max="15.0" step="0.5" value="${curCap}" class="cyber-slider" style="flex: 1;" />
          <input type="number" id="cap-num" min="2.0" max="15.0" step="0.5" value="${curCap}" class="cyber-num-input" />
        </div>

        <div style="display: flex; gap: 6px; margin-bottom: 24px;">
          <button class="preset-btn gpl-preset" data-tara="3.7" data-cap="5.0">Beyfin 5kg</button>
          <button class="preset-btn gpl-preset" data-tara="5.4" data-cap="10.0">Beyfin 10kg</button>
          <button class="preset-btn gpl-preset" data-tara="11.0" data-cap="10.0">Acciaio 10kg</button>
        </div>

        <div style="display: flex; gap: 12px;">
          <button id="modal-apply-btn" class="modal-action-btn primary" style="flex: 1;">SALVA CALIBRAZIONE</button>
          <button id="modal-close-btn" class="modal-action-btn secondary">CHIUDI</button>
        </div>
      `;

      const taraSlider = content.querySelector('#tara-slider');
      const taraNum = content.querySelector('#tara-num');
      taraSlider.addEventListener('input', () => { taraNum.value = taraSlider.value; });
      taraNum.addEventListener('input', () => { taraSlider.value = taraNum.value; });

      const capSlider = content.querySelector('#cap-slider');
      const capNum = content.querySelector('#cap-num');
      capSlider.addEventListener('input', () => { capNum.value = capSlider.value; });
      capNum.addEventListener('input', () => { capSlider.value = capNum.value; });

      content.querySelectorAll('.gpl-preset').forEach(btn => {
        btn.addEventListener('click', () => {
          const t = btn.getAttribute('data-tara');
          const c = btn.getAttribute('data-cap');
          taraSlider.value = t;
          taraNum.value = t;
          capSlider.value = c;
          capNum.value = c;
        });
      });

      content.querySelector('#modal-apply-btn').addEventListener('click', () => {
        const tVal = parseFloat(taraNum.value);
        const cVal = parseFloat(capNum.value);
        if (!isNaN(tVal)) {
          this._hass.callService('input_number', 'set_value', {
            entity_id: this._config.gpl_tara_entity,
            value: tVal
          });
        }
        if (!isNaN(cVal)) {
          this._hass.callService('input_number', 'set_value', {
            entity_id: this._config.gpl_capacity_entity,
            value: cVal
          });
        }
        this._closeCustomModal();
      });

      content.querySelector('#modal-close-btn').addEventListener('click', () => {
        this._closeCustomModal();
      });
    }

    modal.style.display = 'flex';
  }

  _closeCustomModal() {
    this._activeModal = null;
    const modal = this.shadowRoot.getElementById('custom-modal');
    if (modal) modal.style.display = 'none';
  }

  _getAttrs(entityId) {
    if (!this._hass || !entityId || !this._hass.states[entityId]) return {};
    return this._hass.states[entityId].attributes || {};
  }

  _getState(entityId, defaultVal = '--') {
    if (!this._hass || !this._hass.states[entityId]) return defaultVal;
    const val = this._hass.states[entityId].state;
    return (val === 'unavailable' || val === 'unknown') ? defaultVal : val;
  }

  _getFloat(entityId, defaultVal = 0, round = 1) {
    const s = this._getState(entityId, null);
    if (s === null) return defaultVal;
    const f = parseFloat(s);
    return isNaN(f) ? defaultVal : parseFloat(f.toFixed(round));
  }

  _getCardinal(deg) {
    const cardinals = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const val = Math.floor((deg / 22.5) + 0.5);
    return cardinals[(val % 16)];
  }

  _buildDOM() {
    this._domCreated = true;
    const circ = 2 * Math.PI * 70;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #f3f8fb;
          --bg-dark: #060f18;
          --panel: #0d1e2c;
          --panel-alt: #102537;
          --line: #1c3b52;
          --accent-cyan: #48d6ff;
          --accent-ice: #0ea5e9;
          --accent-lime: #6de10f;
          --accent-amber: #f59e0b;
          --accent-red: #ef4444;
          --text-muted: #8aa4b7;
        }

        .cockpit-box {
          background: radial-gradient(circle at 50% 0%, #10273a 0%, #060f18 75%);
          border: 1px solid var(--line);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          position: relative;
        }

        /* Top Bar */
        .top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          font-size: 1.15rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .brand-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-cyan);
          box-shadow: 0 0 10px var(--accent-cyan);
        }
        .brand span em {
          color: var(--accent-cyan);
          font-style: normal;
        }

        .controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .lock-btn {
          background: rgba(72, 214, 255, 0.12);
          border: 1px solid var(--accent-cyan);
          color: var(--accent-cyan);
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          user-select: none;
        }
        .lock-btn:hover {
          transform: scale(1.04);
        }

        /* Carousel viewport */
        .viewport {
          overflow: hidden;
          width: 100%;
          position: relative;
          touch-action: pan-y;
        }
        .slides-wrapper {
          display: flex;
          width: 100%;
          transition: transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1);
        }
        .slide {
          flex: 0 0 100%;
          width: 100%;
          padding: 24px 28px 20px;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 1fr 1.35fr;
          gap: 28px;
          align-items: center;
        }

        @media (max-width: 768px) {
          .slide {
            grid-template-columns: 1fr;
            padding: 20px 16px;
            gap: 20px;
          }
        }

        /* Dial Gauge Card */
        .gauge-card {
          background: rgba(13, 30, 44, 0.65);
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.4);
        }
        .gauge-card.clickable {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .gauge-card.clickable:hover {
          border-color: var(--accent-cyan);
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
        }
        .dial-box {
          position: relative;
          width: 190px;
          height: 190px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .svg-dial {
          position: absolute;
          top: 0;
          left: 0;
          width: 190px;
          height: 190px;
          transform: rotate(-90deg);
        }
        .dial-track {
          stroke: rgba(255, 255, 255, 0.08);
          stroke-width: 11;
          fill: none;
        }
        .dial-val {
          stroke-width: 11;
          stroke-linecap: round;
          fill: none;
          transition: stroke-dashoffset 0.6s ease, stroke 0.4s ease;
        }
        .gauge-data {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          pointer-events: none;
          z-index: 2;
        }
        .gauge-main-val {
          font-size: 3.2rem;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.04em;
          transition: color 0.3s ease;
        }
        .gauge-unit {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .gauge-subtitle {
          margin-top: 14px;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        /* Telemetry Metrics Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        .metric-tile {
          background: rgba(16, 37, 55, 0.6);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.2s ease;
        }
        .metric-tile.clickable {
          cursor: pointer;
          position: relative;
        }
        .metric-tile.clickable:hover {
          border-color: var(--accent-cyan);
          background: rgba(20, 48, 72, 0.85);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
        .metric-tile.clickable:active {
          transform: translateY(0);
        }
        .metric-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--text-muted);
          font-size: 0.78rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .ctrl-badge {
          font-size: 0.68rem;
          padding: 2px 8px;
          border-radius: 6px;
          background: rgba(72, 214, 255, 0.15);
          color: var(--accent-cyan);
          border: 1px solid rgba(72, 214, 255, 0.35);
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .metric-val {
          font-size: 1.85rem;
          font-weight: 800;
          line-height: 1.15;
          margin-top: 6px;
          transition: color 0.3s ease;
        }
        .metric-val small {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-left: 3px;
        }
        .metric-sub {
          font-size: 0.75rem;
          color: var(--accent-cyan);
          margin-top: 4px;
          font-weight: 500;
        }

        /* Symmetrical Temperature Tiles */
        .temp-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        .temp-tile {
          background: rgba(16, 37, 55, 0.6);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: border-color 0.2s ease;
        }
        .temp-tile:hover {
          border-color: rgba(72, 214, 255, 0.4);
        }
        .temp-title {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .temp-val {
          font-size: 2.1rem;
          font-weight: 800;
          line-height: 1.1;
          margin-top: 6px;
          letter-spacing: -0.02em;
        }
        .temp-val small {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-left: 4px;
        }
        .temp-sub {
          font-size: 0.74rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        /* HEADING-UP COMPASS */
        .compass-viewport {
          position: relative;
          width: 200px;
          height: 200px;
          display: grid;
          place-items: center;
        }
        .compass-rose {
          position: absolute;
          width: 196px;
          height: 196px;
          transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.3, 1);
        }
        .van-center-fixed {
          position: absolute;
          width: 52px;
          height: 84px;
          z-index: 5;
          pointer-events: none;
          filter: drop-shadow(0 0 14px rgba(72, 214, 255, 0.45));
        }
        .heading-indicator-pip {
          position: absolute;
          top: 2px;
          left: 50%;
          transform: translateX(-50%);
          color: var(--accent-amber);
          font-size: 14px;
          font-weight: 900;
          z-index: 6;
          text-shadow: 0 0 8px var(--accent-amber);
        }

        /* Bottom Nav Bar - Smooth Horizontal Scrolling */
        .nav-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          overflow-x: auto;
          white-space: nowrap;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .nav-bar::-webkit-scrollbar {
          display: none;
        }
        @media (min-width: 900px) {
          .nav-bar {
            justify-content: center;
          }
        }
        .nav-item {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid transparent;
          color: var(--text-muted);
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }
        .nav-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }
        .nav-item.active {
          background: rgba(72, 214, 255, 0.15);
          border-color: var(--accent-cyan);
          color: #fff;
          box-shadow: 0 0 14px rgba(72, 214, 255, 0.25);
        }
        .nav-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--text-muted);
        }
        .nav-item.active .nav-dot {
          background: var(--accent-cyan);
          box-shadow: 0 0 8px var(--accent-cyan);
        }

        /* CUSTOM MODAL OVERLAY */
        .modal-overlay {
          position: absolute;
          inset: 0;
          background: rgba(6, 15, 24, 0.88);
          backdrop-filter: blur(12px);
          z-index: 100;
          display: none;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
        }
        .modal-card {
          background: #0d1e2c;
          border: 1px solid var(--accent-cyan);
          border-radius: 20px;
          padding: 26px 28px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.85);
          animation: modalIn 0.2s cubic-bezier(0.2, 0.9, 0.3, 1);
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .modal-title {
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: var(--accent-cyan);
          margin-bottom: 4px;
        }
        .modal-subtitle {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-bottom: 20px;
        }
        .cyber-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 10px;
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.12);
          outline: none;
        }
        .cyber-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--accent-cyan);
          cursor: pointer;
          box-shadow: 0 0 12px var(--accent-cyan);
        }
        .cyber-num-input {
          width: 72px;
          background: rgba(6, 15, 24, 0.9);
          border: 1px solid var(--line);
          border-radius: 8px;
          color: #fff;
          font-size: 1.3rem;
          font-weight: 800;
          text-align: center;
          padding: 8px 4px;
        }
        .cyber-num-input:focus {
          outline: none;
          border-color: var(--accent-cyan);
        }
        .preset-btn {
          flex: 1;
          padding: 8px 4px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-muted);
          font-weight: 700;
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .preset-btn:hover {
          background: rgba(72, 214, 255, 0.15);
          border-color: var(--accent-cyan);
          color: #fff;
        }
        .modal-action-btn {
          padding: 12px 20px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.88rem;
          letter-spacing: 0.04em;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .modal-action-btn.primary {
          background: var(--accent-cyan);
          color: #060f18;
        }
        .modal-action-btn.primary:hover {
          filter: brightness(1.15);
          transform: translateY(-1px);
        }
        .modal-action-btn.secondary {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-muted);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .modal-action-btn.secondary:hover {
          color: #fff;
        }
        .modal-toggle-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 0.8rem;
          border: none;
          cursor: pointer;
        }
        .modal-toggle-btn.on {
          background: rgba(109, 225, 15, 0.18);
          border: 1px solid var(--accent-lime);
          color: var(--accent-lime);
        }
        .modal-toggle-btn.off {
          background: rgba(239, 68, 68, 0.18);
          border: 1px solid var(--accent-red);
          color: #fca5a5;
        }
        .mode-select-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16px 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          cursor: pointer;
          gap: 6px;
          transition: all 0.15s;
        }
        .mode-select-btn:hover {
          border-color: var(--accent-cyan);
          background: rgba(72, 214, 255, 0.1);
        }
        .mode-select-btn.active {
          border-color: var(--accent-lime);
          background: rgba(109, 225, 15, 0.15);
          box-shadow: 0 0 16px rgba(109, 225, 15, 0.2);
        }
        .mode-select-btn strong {
          font-size: 0.85rem;
          letter-spacing: 0.04em;
        }
        .mode-select-btn small {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
      </style>

      <div class="cockpit-box">
        <div class="modal-overlay" id="custom-modal">
          <div class="modal-card" id="modal-dynamic-content">
          </div>
        </div>

        <div class="top-bar">
          <div class="brand">
            <div class="brand-dot"></div>
            <span>${this._config.title} <em>PRO</em></span>
          </div>

          <div class="controls">
            <button class="lock-btn" id="lock-toggle">
              <span>▶ AUTO-CYCLE</span>
            </button>
          </div>
        </div>

        <div class="viewport" id="viewport">
          <div class="slides-wrapper" id="slides-wrapper">
            
            <!-- SLIDE 1: BATTERIA & ENERGIA -->
            <div class="slide">
              <div class="gauge-card">
                <div class="dial-box">
                  <svg class="svg-dial" viewBox="0 0 180 180">
                    <circle class="dial-track" cx="90" cy="90" r="70" />
                    <circle class="dial-val" id="dial-soc" cx="90" cy="90" r="70" 
                      stroke="var(--accent-lime)"
                      stroke-dasharray="${circ}" 
                      stroke-dashoffset="${circ}" />
                  </svg>
                  <div class="gauge-data">
                    <div class="gauge-main-val" id="val-soc" style="color: var(--accent-lime)">--</div>
                    <div class="gauge-unit">% SOC</div>
                  </div>
                </div>
                <div class="gauge-subtitle">Batteria Servizi</div>
              </div>

              <div class="metrics-grid">
                <div class="metric-tile">
                  <div class="metric-head">Tensione BS</div>
                  <div class="metric-val" style="color: var(--accent-cyan)"><span id="val-bs-volt">--</span><small>V</small></div>
                  <div class="metric-sub">SmartShunt 300A</div>
                </div>
                <div class="metric-tile">
                  <div class="metric-head">Tensione BM (Motore)</div>
                  <div class="metric-val" style="color: var(--accent-lime)"><span id="val-bm-volt">--</span><small>V</small></div>
                  <div class="metric-sub">Avviamento Sprinter</div>
                </div>
                <div class="metric-tile">
                  <div class="metric-head">Corrente DC</div>
                  <div class="metric-val" id="val-dc-amp-tile"><span id="val-dc-amp">--</span><small>A</small></div>
                  <div class="metric-sub">Potenza: <span id="val-dc-pow">--</span> W</div>
                </div>
                <div class="metric-tile">
                  <div class="metric-head">Autonomia Residua</div>
                  <div class="metric-val" style="font-size: 1.45rem" id="val-timetogo">--</div>
                  <div class="metric-sub">Time to Go</div>
                </div>
              </div>
            </div>

            <!-- SLIDE 2: SOLARE & ALTERNATORE -->
            <div class="slide">
              <div class="gauge-card">
                <div class="dial-box">
                  <svg class="svg-dial" viewBox="0 0 180 180">
                    <circle class="dial-track" cx="90" cy="90" r="70" />
                    <circle class="dial-val" id="dial-solar" cx="90" cy="90" r="70" 
                      stroke="var(--accent-cyan)"
                      stroke-dasharray="${circ}" 
                      stroke-dashoffset="${circ}" />
                  </svg>
                  <div class="gauge-data">
                    <div class="gauge-main-val" id="val-solar-pow" style="color: var(--accent-cyan)">--</div>
                    <div class="gauge-unit">WATT PV</div>
                  </div>
                </div>
                <div class="gauge-subtitle">SmartSolar MPPT</div>
              </div>

              <div class="metrics-grid">
                <div class="metric-tile">
                  <div class="metric-head">Tensione Pannelli</div>
                  <div class="metric-val"><span id="val-solar-volt">--</span><small>V</small></div>
                  <div class="metric-sub">Corrente: <span id="val-solar-amp">--</span> A</div>
                </div>
                <div class="metric-tile">
                  <div class="metric-head">Resa Odierna</div>
                  <div class="metric-val" style="color: var(--accent-lime)"><span id="val-solar-yield">--</span><small>kWh</small></div>
                  <div class="metric-sub">Stato: <span id="val-solar-state">--</span></div>
                </div>
                
                <!-- CLICKABLE ORION XS TILE -->
                <div class="metric-tile clickable" id="tile-orion" title="Tocca per regolare Ampere e On/Off di Orion XS">
                  <div class="metric-head">
                    <span>ORION XS (Alternatore)</span>
                    <span class="ctrl-badge">⚙ REGOLA</span>
                  </div>
                  <div class="metric-val" id="val-orion-tile"><span id="val-orion-amp">--</span><small>A</small></div>
                  <div class="metric-sub" id="val-orion-sub">Tocca per regolare</div>
                </div>

                <div class="metric-tile">
                  <div class="metric-head">Ricarica Combinata</div>
                  <div class="metric-val" style="color: var(--accent-cyan)"><span id="val-comb-pow">--</span><small>W</small></div>
                  <div class="metric-sub">Solare + Alternatore</div>
                </div>
              </div>
            </div>

            <!-- SLIDE 3: MULTIPLUS INVERTER 230V -->
            <div class="slide">
              <div class="gauge-card clickable" id="tile-mp-inverter" title="Tocca per comandi diretti MultiPlus">
                <div style="font-size: 2.8rem; margin-bottom: 4px;">⚡</div>
                <div class="gauge-main-val" id="val-mp-pow" style="font-size: 2.2rem; color: var(--accent-cyan)">--</div>
                <div class="gauge-unit">WATT 230V</div>
                <div class="gauge-subtitle" id="val-mp-sub" style="color: var(--accent-lime);">--</div>
                <span class="ctrl-badge" style="margin-top: 8px;">⚙ COMANDI</span>
              </div>

              <div class="metrics-grid">
                <div class="metric-tile">
                  <div class="metric-head">Tensione Rete 230V</div>
                  <div class="metric-val"><span id="val-mp-volt">--</span><small>V</small></div>
                  <div class="metric-sub">AC Out MultiPlus</div>
                </div>

                <!-- CLICKABLE LIMITE COLONNINA -->
                <div class="metric-tile clickable" id="tile-mp-limit" title="Tocca per regolare Ampere presa colonnina">
                  <div class="metric-head">
                    <span>Limite Colonnina</span>
                    <span class="ctrl-badge">⚙ MODIFICA</span>
                  </div>
                  <div class="metric-val" style="color: var(--accent-amber)"><span id="val-mp-limit">--</span><small>A</small></div>
                  <div class="metric-sub">Tocca per modificare</div>
                </div>

                <!-- CLICKABLE POWERASSIST -->
                <div class="metric-tile clickable" id="tile-mp-pa" title="Tocca per abilitare/disabilitare PowerAssist">
                  <div class="metric-head">
                    <span>PowerAssist</span>
                    <span class="ctrl-badge">ON/OFF</span>
                  </div>
                  <div class="metric-val" id="val-mp-pa-tile"><span id="val-mp-pa">--</span></div>
                  <div class="metric-sub">Supporto Rete AC</div>
                </div>

                <!-- CLICKABLE STATO INVERTER -->
                <div class="metric-tile clickable" id="tile-mp-mode" title="Tocca per comandi diretti accensione/spegnimento">
                  <div class="metric-head">
                    <span>Stato Inverter</span>
                    <span class="ctrl-badge">COMANDI</span>
                  </div>
                  <div class="metric-val" id="val-mp-mode-text" style="font-size: 1.35rem; color: var(--accent-cyan)">--</div>
                  <div class="metric-sub">Tocca per comandi</div>
                </div>
              </div>
            </div>

            <!-- SLIDE 4: ASSETTO & BUSSOLA HEADING-UP -->
            <div class="slide">
              <div class="gauge-card">
                <div class="compass-viewport">
                  <div class="heading-indicator-pip">▲</div>

                  <div class="compass-rose" id="compass-rose" style="transform: rotate(0deg);">
                    <svg viewBox="0 0 200 200" width="196" height="196">
                      <circle cx="100" cy="100" r="94" stroke="rgba(255,255,255,0.12)" stroke-width="2" fill="#07131e" />
                      <circle cx="100" cy="100" r="76" stroke="rgba(72,214,255,0.22)" stroke-width="1.5" stroke-dasharray="3,5" fill="none" />
                      
                      <text x="100" y="27" text-anchor="middle" font-size="16" font-weight="900" fill="#ef4444">N</text>
                      <text x="178" y="106" text-anchor="middle" font-size="15" font-weight="900" fill="#48d6ff">E</text>
                      <text x="100" y="185" text-anchor="middle" font-size="15" font-weight="900" fill="#94a3b8">S</text>
                      <text x="22" y="106" text-anchor="middle" font-size="15" font-weight="900" fill="#48d6ff">W</text>
                      
                      <text x="156" y="48" text-anchor="middle" font-size="10" font-weight="700" fill="#64748b">NE</text>
                      <text x="156" y="162" text-anchor="middle" font-size="10" font-weight="700" fill="#64748b">SE</text>
                      <text x="44" y="162" text-anchor="middle" font-size="10" font-weight="700" fill="#64748b">SW</text>
                      <text x="44" y="48" text-anchor="middle" font-size="10" font-weight="700" fill="#64748b">NW</text>
                      
                      <line x1="100" y1="33" x2="100" y2="45" stroke="#ef4444" stroke-width="3" stroke-linecap="round" />
                      <line x1="167" y1="100" x2="155" y2="100" stroke="#48d6ff" stroke-width="2.5" stroke-linecap="round" />
                      <line x1="100" y1="167" x2="100" y2="155" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
                      <line x1="33" y1="100" x2="45" y2="100" stroke="#48d6ff" stroke-width="2.5" stroke-linecap="round" />
                    </svg>
                  </div>

                  <div class="van-center-fixed">
                    <svg viewBox="0 0 60 100" width="52" height="84">
                      <path d="M14 22 C14 12, 20 6, 30 6 C40 6, 46 12, 46 22 L46 84 C46 90, 42 94, 30 94 C18 94, 14 90, 14 84 Z" 
                            fill="#0d2436" stroke="#48d6ff" stroke-width="2.2" />
                      <path d="M18 26 C18 20, 22 17, 30 17 C38 17, 42 20, 42 26 L40 33 C40 35, 38 36, 30 36 C22 36, 20 35, 20 33 Z" 
                            fill="rgba(72, 214, 255, 0.45)" stroke="#48d6ff" stroke-width="1.2" />
                      <polygon points="17,10 14,2 22,2" fill="#6de10f" />
                      <polygon points="43,10 46,2 38,2" fill="#6de10f" />
                      <path d="M30 46 L30 14 M25 19 L30 11 L35 19" stroke="#6de10f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                      <rect x="20" y="46" width="20" height="26" rx="2" fill="rgba(33, 184, 255, 0.25)" stroke="rgba(72, 214, 255, 0.6)" stroke-width="1" />
                    </svg>
                  </div>
                </div>
                <div class="gauge-subtitle" id="val-heading-label">ROTTA: 0° N</div>
              </div>

              <div class="metrics-grid">
                <div class="metric-tile">
                  <div class="metric-head">Inclinazione Rollio</div>
                  <div class="metric-val" id="val-roll-tile"><span id="val-roll">--</span><small>cm</small></div>
                  <div class="metric-sub" id="val-roll-sub">Asse Trasversale</div>
                </div>
                <div class="metric-tile">
                  <div class="metric-head">Inclinazione Beccheggio</div>
                  <div class="metric-val" id="val-pitch-tile"><span id="val-pitch">--</span><small>cm</small></div>
                  <div class="metric-sub" id="val-pitch-sub">Asse Longitudinale</div>
                </div>
                <div class="metric-tile">
                  <div class="metric-head">Stato Livella</div>
                  <div class="metric-val" id="val-level-tile" style="font-size: 1.35rem;">--</div>
                  <div class="metric-sub" id="val-level-sub">--</div>
                </div>
                <div class="metric-tile">
                  <div class="metric-head">Altitudine GPS</div>
                  <div class="metric-val" style="color: var(--accent-cyan)"><span id="val-altitude">--</span><small>m</small></div>
                  <div class="metric-sub">Quota slm</div>
                </div>
              </div>
            </div>

            <!-- SLIDE 5: GPL & TEMPERATURE -->
            <div class="slide">
              <!-- GAUGE CARD GPL WITH IN-CARD CALIBRATION MODAL -->
              <div class="gauge-card clickable" id="tile-gpl-card" title="Tocca per calibrare Tara e Capacità bombola GPL">
                <div class="dial-box">
                  <svg class="svg-dial" viewBox="0 0 180 180">
                    <circle class="dial-track" cx="90" cy="90" r="70" />
                    <circle class="dial-val" id="dial-gpl" cx="90" cy="90" r="70" 
                      stroke="var(--accent-lime)"
                      stroke-dasharray="${circ}" 
                      stroke-dashoffset="${circ}" />
                  </svg>
                  <div class="gauge-data">
                    <div class="gauge-main-val" id="val-gpl-pct" style="color: var(--accent-lime)">--</div>
                    <div class="gauge-unit">% GPL</div>
                  </div>
                </div>
                <div class="gauge-subtitle" id="val-gpl-sub">Gas: -- kg</div>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">
                  Ultima pesata: <span id="val-gpl-time" style="color: #cbd5e1;">--:--</span>
                </div>
                <span class="ctrl-badge" style="margin-top: 8px;">⚙ CALIBRAZIONE</span>
              </div>

              <!-- SYMMETRICAL TEMPERATURE TILES: INTERNO - ESTERNO / FRIGO - FREEZER -->
              <div class="temp-grid">
                <div class="temp-tile">
                  <div class="temp-title">INTERNO</div>
                  <div class="temp-val" style="color: var(--accent-lime);"><span id="val-temp-in">--</span><small>°C</small></div>
                  <div class="temp-sub">Sensore Van</div>
                </div>

                <div class="temp-tile">
                  <div class="temp-title">ESTERNO</div>
                  <div class="temp-val" style="color: var(--accent-cyan);"><span id="val-temp-out">--</span><small>°C</small></div>
                  <div class="temp-sub">Ambiente Esterno</div>
                </div>

                <div class="temp-tile">
                  <div class="temp-title">FRIGO</div>
                  <div class="temp-val" id="val-temp-frigo-tile"><span id="val-temp-frigo">--</span><small>°C</small></div>
                  <div class="temp-sub" id="val-temp-frigo-sub">Soglia max: 7°C</div>
                </div>

                <div class="temp-tile">
                  <div class="temp-title">FREEZER</div>
                  <div class="temp-val" id="val-temp-freezer-tile"><span id="val-temp-freezer">--</span><small>°C</small></div>
                  <div class="temp-sub" id="val-temp-freezer-sub">Soglia max: -10°C</div>
                </div>
              </div>
            </div>

            <!-- SLIDE 6: MERCEDES SPRINTER -->
            <div class="slide">
              <div class="gauge-card" id="tile-sprinter-card" title="Dati Veicolo Mercedes Sprinter">
                <div class="dial-box">
                  <svg class="svg-dial" viewBox="0 0 180 180">
                    <circle class="dial-track" cx="90" cy="90" r="70" />
                    <circle class="dial-val" id="dial-sprinter-adblue" cx="90" cy="90" r="70" 
                      stroke="#38bdf8"
                      stroke-dasharray="${circ}" 
                      stroke-dashoffset="${circ}" />
                  </svg>
                  <div class="gauge-data">
                    <div class="gauge-main-val" id="val-sprinter-adblue" style="color: #38bdf8">--</div>
                    <div class="gauge-unit">% ADBLUE</div>
                  </div>
                </div>
                <div class="gauge-subtitle" id="val-sprinter-fuel-badge" style="margin-top: 10px; font-size: 0.85rem; color: #94a3b8; font-weight: 700;">⛽ Diesel: --% (-- km)</div>
                <span id="badge-sprinter-warning" class="ctrl-badge" style="margin-top: 8px; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);">✓ SISTEMI OK</span>
              </div>

              <!-- SPRINTER METRICS GRID -->
              <div class="metrics-grid">
                <!-- TILE 1: CARBURANTE DIESEL -->
                <div class="metric-tile">
                  <div class="metric-head">Carburante Diesel</div>
                  <div class="metric-val" style="color: var(--accent-cyan);"><span id="val-sprinter-fuel">--</span><small>%</small></div>
                  <div class="metric-sub" id="val-sprinter-fuel-sub">Autonomia: -- km</div>
                </div>

                <!-- TILE 2: CHIUSURA & VETRI -->
                <div class="metric-tile clickable" id="tile-sprinter-lock" title="Tocca per bloccare/sbloccare portiere veicolo">
                  <div class="metric-head">
                    <span>Chiusura & Vetri</span>
                    <span class="ctrl-badge" id="badge-sprinter-lock">PORTIERE</span>
                  </div>
                  <div class="metric-val" id="val-sprinter-lock" style="font-size: 1.35rem; color: var(--accent-lime)">--</div>
                  <div class="metric-sub" id="val-sprinter-win-sub">Vetri: --</div>
                </div>

                <!-- TILE 3: PNEUMATICI ANTERIORI DEDICATO -->
                <div class="metric-tile">
                  <div class="metric-head">Gomme Anteriori</div>
                  <div style="display: flex; justify-content: space-around; align-items: baseline; margin: 6px 0 2px;">
                    <div style="text-align: center;">
                      <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 700; letter-spacing: 0.5px;">ANT SX</div>
                      <div style="font-size: 1.65rem; font-weight: 800; color: var(--accent-cyan); line-height: 1.1;"><span id="val-tire-fl">--</span><small style="font-size: 0.75rem; font-weight: 600; color: #94a3b8;"> bar</small></div>
                    </div>
                    <div style="width: 1px; height: 32px; background: rgba(255,255,255,0.1); align-self: center;"></div>
                    <div style="text-align: center;">
                      <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 700; letter-spacing: 0.5px;">ANT DX</div>
                      <div style="font-size: 1.65rem; font-weight: 800; color: var(--accent-cyan); line-height: 1.1;"><span id="val-tire-fr">--</span><small style="font-size: 0.75rem; font-weight: 600; color: #94a3b8;"> bar</small></div>
                    </div>
                  </div>
                  <div class="metric-sub" style="text-align: center;">Asse Anteriore</div>
                </div>

                <!-- TILE 4: PNEUMATICI POSTERIORI DEDICATO -->
                <div class="metric-tile">
                  <div class="metric-head">Gomme Posteriori</div>
                  <div style="display: flex; justify-content: space-around; align-items: baseline; margin: 6px 0 2px;">
                    <div style="text-align: center;">
                      <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 700; letter-spacing: 0.5px;">POST SX</div>
                      <div style="font-size: 1.65rem; font-weight: 800; color: var(--accent-cyan); line-height: 1.1;"><span id="val-tire-rl">--</span><small style="font-size: 0.75rem; font-weight: 600; color: #94a3b8;"> bar</small></div>
                    </div>
                    <div style="width: 1px; height: 32px; background: rgba(255,255,255,0.1); align-self: center;"></div>
                    <div style="text-align: center;">
                      <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 700; letter-spacing: 0.5px;">POST DX</div>
                      <div style="font-size: 1.65rem; font-weight: 800; color: var(--accent-cyan); line-height: 1.1;"><span id="val-tire-rr">--</span><small style="font-size: 0.75rem; font-weight: 600; color: #94a3b8;"> bar</small></div>
                    </div>
                  </div>
                  <div class="metric-sub" style="text-align: center;">Asse Posteriore</div>
                </div>
              </div>
            </div>

                      <!-- SLIDE 7: DIESEL PRO (RADAR PREZZI) -->
            <!-- SLIDE 7: DIESEL PRO (RADAR PREZZI) -->
            <div class="slide">
              <!-- GAUGE CARD: 1° MIGLIOR PREZZO DIESEL -->
              <div class="gauge-card clickable" id="card-diesel-hero" title="Tocca per avviare navigazione Google Maps">
                <div class="dial-box">
                  <svg class="svg-dial" viewBox="0 0 180 180">
                    <circle class="dial-track" cx="90" cy="90" r="70" />
                    <circle class="dial-val" id="dial-diesel" cx="90" cy="90" r="70"
                      stroke="var(--accent-lime)"
                      stroke-dasharray="${circ}"
                      stroke-dashoffset="${circ * 0.25}" />
                  </svg>
                  <div class="gauge-data">
                    <div class="gauge-main-val" id="val-diesel-price" style="font-size: 2.15rem; color: var(--accent-lime); font-weight: 800;">--</div>
                    <div class="gauge-unit" id="val-diesel-currency">EUR/L</div>
                    <div class="gauge-subtitle" style="color: var(--accent-lime); letter-spacing: 0.08em;">DIESEL MIN</div>
                  </div>
                </div>
                <div style="margin-top: 14px; text-align: center; width: 100%;">
                  <div style="font-size: 1.05rem; font-weight: 800; color: #fff; letter-spacing: 0.5px;" id="val-diesel-best-name">Stazione...</div>
                  <div style="font-size: 0.78rem; color: var(--accent-cyan); font-weight: 700; margin-top: 2px;" id="val-diesel-best-dist">-- km dal van</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; margin-inline: auto;" id="val-diesel-best-addr">--</div>
                  <div style="margin-top: 8px; display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 999px; background: rgba(72, 214, 255, 0.12); border: 1px solid var(--accent-cyan); color: var(--accent-cyan); font-size: 0.72rem; font-weight: 800;">
                    🧭 NAVIGA GOOGLE MAPS
                  </div>
                </div>
              </div>

              <!-- RIGHT GRID: RADAR ON/OFF + TOP 2/3 + AGGIORNA & RAGGIO -->
              <div class="metrics-grid">
                <!-- TILE 1: RADAR BACKGROUND INTERRUTTORE -->
                <div class="metric-tile clickable" id="tile-diesel-radar" style="border-color: rgba(72, 214, 255, 0.25);">
                  <div class="metric-head">
                    <span>Radar In Viaggio</span>
                    <span class="ctrl-badge" id="badge-diesel-radar">SWITCH</span>
                  </div>
                  <div class="metric-val" id="val-diesel-radar-state" style="font-size: 1.35rem; color: var(--text-muted)">OFF</div>
                  <div class="metric-sub" id="val-diesel-radar-sub">Tocca per attivare avvisi automatici</div>
                </div>

                <!-- TILE 2: 2° MIGLIOR PREZZO -->
                <div class="metric-tile clickable" id="tile-diesel-st2">
                  <div class="metric-head">
                    <span>2° Miglior Prezzo</span>
                    <span class="ctrl-badge" style="background: rgba(255,255,255,0.08); color: #fff;">TOP 2</span>
                  </div>
                  <div class="metric-val" id="val-diesel-st2-price" style="font-size: 1.35rem; color: var(--accent-cyan)">--</div>
                  <div class="metric-sub" id="val-diesel-st2-info">Nessuna stazione</div>
                </div>

                <!-- TILE 3: 3° MIGLIOR PREZZO -->
                <div class="metric-tile clickable" id="tile-diesel-st3">
                  <div class="metric-head">
                    <span>3° Miglior Prezzo</span>
                    <span class="ctrl-badge" style="background: rgba(255,255,255,0.08); color: #fff;">TOP 3</span>
                  </div>
                  <div class="metric-val" id="val-diesel-st3-price" style="font-size: 1.35rem; color: var(--accent-cyan)">--</div>
                  <div class="metric-sub" id="val-diesel-st3-info">Nessuna stazione</div>
                </div>

                <!-- TILE 4: AGGIORNA ORA & RAGGIO PRESETS -->
                <div class="metric-tile clickable" id="tile-diesel-refresh" style="background: rgba(109, 225, 15, 0.06); border-color: rgba(109, 225, 15, 0.25);" title="Tocca per raggio di ricerca e tasti rapidi">
                  <div class="metric-head">
                    <span>Raggio & Cerca</span>
                    <span class="ctrl-badge" id="badge-diesel-radius" style="background: rgba(109, 225, 15, 0.18); color: var(--accent-lime); border-color: var(--accent-lime);">10 KM</span>
                  </div>
                  <div class="metric-val" id="val-diesel-search-btn" style="font-size: 1.25rem; color: var(--accent-lime)">🔄 Cerca Ora</div>
                  <div class="metric-sub" id="val-diesel-last-update">Tocca: raggio & tasti rapidi</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- HORIZONTALLY SCROLLABLE NAVIGATION -->
        <div class="nav-bar">
          <div class="nav-item dot-btn active" data-idx="0">
            <div class="nav-dot"></div>
            <span>Batteria</span>
          </div>
          <div class="nav-item dot-btn" data-idx="1">
            <div class="nav-dot"></div>
            <span>Solare & Orion</span>
          </div>
          <div class="nav-item dot-btn" data-idx="2">
            <div class="nav-dot"></div>
            <span>MultiPlus 230V</span>
          </div>
          <div class="nav-item dot-btn" data-idx="3">
            <div class="nav-dot"></div>
            <span>Assetto & Bussola</span>
          </div>
          <div class="nav-item dot-btn" data-idx="4">
            <div class="nav-dot"></div>
            <span>GPL & Temperature</span>
          </div>
          <div class="nav-item dot-btn" data-idx="5">
            <div class="nav-dot"></div>
            <span>Sprinter</span>
          </div>
          <div class="nav-item dot-btn" data-idx="6">
            <div class="nav-dot"></div>
            <span>Diesel Pro</span>
          </div>

        </div>
      </div>
    `;

    // Event listeners
    const lockBtn = this.shadowRoot.getElementById('lock-toggle');
    if (lockBtn) {
      lockBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleLock();
      });
    }

    const dotBtns = this.shadowRoot.querySelectorAll('.dot-btn');
    dotBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-idx'));
        this._setSlide(idx);
      });
    });

    // Touch Swipe Gestures
    const viewport = this.shadowRoot.getElementById('viewport');
    if (viewport) {
      viewport.addEventListener('touchstart', (e) => {
        this._touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      viewport.addEventListener('touchend', (e) => {
        this._touchEndX = e.changedTouches[0].screenX;
        const diff = this._touchStartX - this._touchEndX;
        if (Math.abs(diff) > 45) {
          if (diff > 0) {
            this._setSlide((this._currentSlide + 1) % 7);
          } else {
            this._setSlide((this._currentSlide + 6) % 7);
          }
        }
      }, { passive: true });
    }

    // Direct Control Modals
    const tileOrion = this.shadowRoot.getElementById('tile-orion');
    if (tileOrion) {
      tileOrion.addEventListener('click', (e) => {
        e.stopPropagation();
        this._openCustomModal('orion');
      });
    }

    const tileMpInverter = this.shadowRoot.getElementById('tile-mp-inverter');
    if (tileMpInverter) {
      tileMpInverter.addEventListener('click', (e) => {
        e.stopPropagation();
        this._openCustomModal('mp_mode');
      });
    }

    const tileMpMode = this.shadowRoot.getElementById('tile-mp-mode');
    if (tileMpMode) {
      tileMpMode.addEventListener('click', (e) => {
        e.stopPropagation();
        this._openCustomModal('mp_mode');
      });
    }

    const tileMpLimit = this.shadowRoot.getElementById('tile-mp-limit');
    if (tileMpLimit) {
      tileMpLimit.addEventListener('click', (e) => {
        e.stopPropagation();
        this._openCustomModal('mp_limit');
      });
    }

    const tileMpPa = this.shadowRoot.getElementById('tile-mp-pa');
    if (tileMpPa) {
      tileMpPa.addEventListener('click', (e) => {
        e.stopPropagation();
        this._hass.callService('switch', 'toggle', { entity_id: this._config.multiplus_powerassist_entity });
      });
    }

    // GPL Calibration Modal
    const tileGplCard = this.shadowRoot.getElementById('tile-gpl-card');
    if (tileGplCard) {
      tileGplCard.addEventListener('click', (e) => {
        e.stopPropagation();
        this._openCustomModal('gpl_calib');
      });
    }

    // Sprinter Lock Toggle
    const tileSprinterLock = this.shadowRoot.getElementById('tile-sprinter-lock');
    if (tileSprinterLock) {
      tileSprinterLock.addEventListener('click', (e) => {
        e.stopPropagation();
        const curLock = this._getState(this._config.lock_entity, 'locked');
        const svc = curLock === 'locked' ? 'unlock' : 'lock';
        this._hass.callService('lock', svc, { entity_id: this._config.lock_entity });
      });
    }

    // Slide 7: Diesel Handlers
    const cardDieselHero = this.shadowRoot.getElementById('card-diesel-hero');
    if (cardDieselHero) {
      cardDieselHero.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this._dieselBestMapsUrl) {
          window.open(this._dieselBestMapsUrl, '_blank');
        }
      });
    }

    const tileDieselRadar = this.shadowRoot.getElementById('tile-diesel-radar');
    if (tileDieselRadar) {
      tileDieselRadar.addEventListener('click', (e) => {
        e.stopPropagation();
        this._hass.callService('input_boolean', 'toggle', { entity_id: this._config.radar_switch_entity || 'input_boolean.radar_diesel_attivo' });
      });
    }

    const tileDieselSt2 = this.shadowRoot.getElementById('tile-diesel-st2');
    if (tileDieselSt2) {
      tileDieselSt2.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this._dieselSt2MapsUrl) {
          window.open(this._dieselSt2MapsUrl, '_blank');
        }
      });
    }

    const tileDieselSt3 = this.shadowRoot.getElementById('tile-diesel-st3');
    if (tileDieselSt3) {
      tileDieselSt3.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this._dieselSt3MapsUrl) {
          window.open(this._dieselSt3MapsUrl, '_blank');
        }
      });
    }

    const tileDieselRefresh = this.shadowRoot.getElementById('tile-diesel-refresh');
    if (tileDieselRefresh) {
      tileDieselRefresh.addEventListener('click', (e) => {
        e.stopPropagation();
        this._openCustomModal('diesel_settings');
      });
    }

  }

  _updateValues() {
    if (!this._domCreated || !this._hass) return;

    const circ = 2 * Math.PI * 70;

    // Slide 1: Battery
    const soc = this._getFloat(this._config.soc_entity, 0, 0);
    const bsVolt = this._getFloat(this._config.bs_voltage_entity, 0, 2);
    const bmVolt = this._getFloat(this._config.bm_voltage_entity, 0, 2);
    const dcAmp = this._getFloat(this._config.current_entity, 0, 1);
    const dcPower = this._getFloat(this._config.power_entity, 0, 0);
    const timeToGo = this._getState(this._config.time_to_go_entity, '∞');

    const socColor = soc < 20 ? '#ef4444' : (soc < 45 ? '#f59e0b' : '#6de10f');
    const socOffset = circ - (circ * Math.min(100, Math.max(0, soc)) / 100);

    const elValSoc = this.shadowRoot.getElementById('val-soc');
    if (elValSoc) {
      elValSoc.textContent = soc;
      elValSoc.style.color = socColor;
    }
    const dialSoc = this.shadowRoot.getElementById('dial-soc');
    if (dialSoc) {
      dialSoc.setAttribute('stroke', socColor);
      dialSoc.style.strokeDashoffset = socOffset;
    }
    this._setText('val-bs-volt', bsVolt);
    this._setText('val-bm-volt', bmVolt);
    this._setText('val-dc-amp', (dcAmp > 0 ? '+' : '') + dcAmp);
    this._setText('val-dc-pow', dcPower);
    this._setText('val-timetogo', timeToGo);
    const elDcAmpTile = this.shadowRoot.getElementById('val-dc-amp-tile');
    if (elDcAmpTile) {
      elDcAmpTile.style.color = dcAmp >= 0 ? 'var(--accent-lime)' : 'var(--accent-amber)';
    }

    // Slide 2: Solar & Orion
    const solPower = this._getFloat(this._config.solar_power_entity, 0, 0);
    const solVolt = this._getFloat(this._config.solar_voltage_entity, 0, 1);
    const solAmp = this._getFloat(this._config.solar_current_entity, 0, 1);
    const solYield = this._getFloat(this._config.solar_yield_today_entity, 0, 2);
    const solState = this._getState(this._config.solar_state_entity, 'Standby');
    const orionAmp = this._getFloat(this._config.orion_current_limit_entity, 0, 0);
    const orionOn = this._getState(this._config.orion_switch_entity, 'off') === 'on';

    const solPct = Math.min(100, (solPower / 250) * 100);
    const solOffset = circ - (circ * solPct / 100);

    this._setText('val-solar-pow', solPower);
    const dialSolar = this.shadowRoot.getElementById('dial-solar');
    if (dialSolar) dialSolar.style.strokeDashoffset = solOffset;
    this._setText('val-solar-volt', solVolt);
    this._setText('val-solar-amp', solAmp);
    this._setText('val-solar-yield', solYield);
    this._setText('val-solar-state', solState);
    this._setText('val-orion-amp', orionAmp);
    const elOrionTile = this.shadowRoot.getElementById('val-orion-tile');
    if (elOrionTile) elOrionTile.style.color = orionOn ? 'var(--accent-lime)' : 'var(--text-muted)';
    this._setText('val-orion-sub', orionOn ? 'In Carica DC-DC (Tocca per regolare)' : 'Standby Alternatore (Tocca per regolare)');
    this._setText('val-comb-pow', Math.round(solPower + (orionOn ? orionAmp * bsVolt : 0)));

    // Slide 3: MultiPlus
    const mpMode = this._getState(this._config.multiplus_mode_entity, 'OFF').replace(/_/g, ' ').toUpperCase();
    const mpPower = this._getFloat(this._config.multiplus_power_entity, 0, 0);
    const mpVolt = this._getFloat(this._config.multiplus_voltage_entity, 0, 0);
    const mpLimit = this._getFloat(this._config.multiplus_limit_entity, 16, 0);
    const mpPowerAssist = this._getState(this._config.multiplus_powerassist_entity, 'off') === 'on';

    this._setText('val-mp-pow', mpPower);
    this._setText('val-mp-sub', mpMode);
    this._setText('val-mp-volt', mpVolt);
    this._setText('val-mp-limit', mpLimit);
    this._setText('val-mp-pa', mpPowerAssist ? 'ATTIVO' : 'OFF');
    const elPaTile = this.shadowRoot.getElementById('val-mp-pa-tile');
    if (elPaTile) elPaTile.style.color = mpPowerAssist ? 'var(--accent-lime)' : 'var(--text-muted)';
    this._setText('val-mp-mode-text', mpMode);

    // Slide 4: Nav & Heading-Up Compass + CM Level
    const rollCm = this._getFloat(this._config.roll_cm_entity, 0, 1);
    const pitchCm = this._getFloat(this._config.pitch_cm_entity, 0, 1);
    const rollDeg = this._getFloat(this._config.roll_entity, 0, 1);
    const pitchDeg = this._getFloat(this._config.pitch_entity, 0, 1);
    const isLevel = this._getState(this._config.level_status_entity, 'off') === 'on';
    const altitude = this._getFloat(this._config.altitude_entity, 0, 0);
    const heading = this._getFloat(this._config.heading_entity, 0, 0);

    const rose = this.shadowRoot.getElementById('compass-rose');
    if (rose) rose.style.transform = `rotate(${-heading}deg)`;
    
    const cardinal = this._getCardinal(heading);
    this._setText('val-heading-label', `ROTTA: ${Math.round(heading)}° ${cardinal}`);

    this._setText('val-roll', rollCm);
    this._setText('val-roll-sub', `Asse Trasversale (${rollDeg}°)`);
    const rollTile = this.shadowRoot.getElementById('val-roll-tile');
    if (rollTile) rollTile.style.color = Math.abs(rollCm) > 2 ? 'var(--accent-amber)' : 'var(--accent-lime)';

    this._setText('val-pitch', pitchCm);
    this._setText('val-pitch-sub', `Asse Longitudinale (${pitchDeg}°)`);
    const pitchTile = this.shadowRoot.getElementById('val-pitch-tile');
    if (pitchTile) pitchTile.style.color = Math.abs(pitchCm) > 2 ? 'var(--accent-amber)' : 'var(--accent-lime)';

    const lvlTile = this.shadowRoot.getElementById('val-level-tile');
    if (lvlTile) {
      lvlTile.textContent = isLevel ? 'LIVELLATO' : 'INCLINATO';
      lvlTile.style.color = isLevel ? 'var(--accent-lime)' : 'var(--accent-amber)';
    }
    this._setText('val-level-sub', isLevel ? 'In bolla perfetta' : 'Cunei consigliati');
    this._setText('val-altitude', altitude);

    // Slide 5: GPL & Symmetrical Temperatures
    // Read GPL percent: try calculated or memory, fallback to 0
    let gplPct = this._getFloat(this._config.gpl_pct_entity, null, 0);
    if (gplPct === null || isNaN(gplPct)) {
      gplPct = this._getFloat(this._config.gpl_pct_mem_entity, 0, 0);
    }
    let gplKg = this._getFloat(this._config.gpl_weight_entity, null, 1);
    if (gplKg === null || isNaN(gplKg)) {
      gplKg = this._getFloat(this._config.gpl_weight_mem_entity, 0, 1);
    }
    const gplTime = this._getState(this._config.gpl_time_entity, '');
    const tempIn = this._getFloat(this._config.temp_in_entity, 0, 1);
    const tempOut = this._getFloat(this._config.temp_out_entity, 0, 1);
    const tempFrigo = this._getFloat(this._config.temp_frigo_entity, 0, 1);
    const tempFreezer = this._getFloat(this._config.temp_freezer_entity, 0, 1);

    // Dynamic GPL color thresholds: Green (>30%), Yellow (15-30%), Red (<15%)
    let gplColor = '#6de10f';
    if (gplPct < 15) {
      gplColor = '#ef4444';
    } else if (gplPct < 30) {
      gplColor = '#f59e0b';
    }

    const gplOffset = circ - (circ * Math.min(100, Math.max(0, gplPct)) / 100);

    const elGplPct = this.shadowRoot.getElementById('val-gpl-pct');
    if (elGplPct) {
      elGplPct.textContent = gplPct;
      elGplPct.style.color = gplColor;
    }
    const dialGpl = this.shadowRoot.getElementById('dial-gpl');
    if (dialGpl) {
      dialGpl.setAttribute('stroke', gplColor);
      dialGpl.style.strokeDashoffset = gplOffset;
    }
    this._setText('val-gpl-sub', `Gas: ${gplKg} kg`);

    let gplFormattedTime = '--:--';
    if (gplTime && gplTime !== '--') {
      try {
        const d = new Date(gplTime);
        gplFormattedTime = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      } catch(e) {}
    }
    this._setText('val-gpl-time', gplFormattedTime);

    // Temperature formatting
    this._setText('val-temp-in', tempIn);
    this._setText('val-temp-out', tempOut);
    this._setText('val-temp-frigo', tempFrigo);
    this._setText('val-temp-freezer', tempFreezer);

    // Frigo Threshold: Red if > 7°C, Cyan (#48d6ff) if <= 7°C
    const frigoTile = this.shadowRoot.getElementById('val-temp-frigo-tile');
    const frigoSub = this.shadowRoot.getElementById('val-temp-frigo-sub');
    if (frigoTile) {
      if (tempFrigo > 7.0) {
        frigoTile.style.color = '#ef4444';
        if (frigoSub) frigoSub.textContent = 'Allarme Temp (>7°C)';
      } else {
        frigoTile.style.color = '#48d6ff';
        if (frigoSub) frigoSub.textContent = 'Ottimale (<=7°C)';
      }
    }

    // Freezer Threshold: Red if > -10°C, Deep Ice Blue (#0ea5e9) if <= -10°C
    const freezerTile = this.shadowRoot.getElementById('val-temp-freezer-tile');
    const freezerSub = this.shadowRoot.getElementById('val-temp-freezer-sub');
    if (freezerTile) {
      if (tempFreezer > -10.0) {
        freezerTile.style.color = '#ef4444';
        if (freezerSub) freezerSub.textContent = 'Allarme Temp (>-10°C)';
      } else {
        freezerTile.style.color = '#0ea5e9';
        if (freezerSub) freezerSub.textContent = 'Ghiaccio Ottimale (<=-10°C)';
      }
    }

    // Slide 6: Sprinter (AdBlue Hero Dial + Reduced Fuel)
    const adblue = this._getFloat(this._config.adblue_entity, 0, 0);
    const adblueOffset = circ - (circ * Math.min(100, Math.max(0, adblue)) / 100);
    const adblueColor = adblue < 15 ? '#ef4444' : (adblue < 25 ? '#f59e0b' : '#38bdf8');
    this._setText('val-sprinter-adblue', adblue);
    const elAdblue = this.shadowRoot.getElementById('val-sprinter-adblue');
    if (elAdblue) elAdblue.style.color = adblueColor;
    const dialAdblue = this.shadowRoot.getElementById('dial-sprinter-adblue');
    if (dialAdblue) {
      dialAdblue.setAttribute('stroke', adblueColor);
      dialAdblue.style.strokeDashoffset = adblueOffset;
    }

    const fuel = this._getFloat(this._config.fuel_entity, 0, 0);
    const range = this._getState(this._config.range_entity, '--');
    this._setText('val-sprinter-fuel-badge', `⛽ Diesel: ${fuel}% (${range} km)`);
    this._setText('val-sprinter-fuel', fuel);
    this._setText('val-sprinter-fuel-sub', `Autonomia: ${range} km`);
    const fuelColor = fuel < 15 ? '#ef4444' : (fuel < 30 ? '#f59e0b' : 'var(--accent-cyan)');
    const elFuel = this.shadowRoot.getElementById('val-sprinter-fuel');
    if (elFuel) elFuel.style.color = fuelColor;

    const warnTire = this._getState(this._config.tire_warn_entity, 'off') === 'on';
    const warnBrake = this._getState(this._config.brake_fluid_entity, 'off') === 'on';
    const warnCool = this._getState(this._config.coolant_entity, 'off') === 'on';
    const badgeWarn = this.shadowRoot.getElementById('badge-sprinter-warning');
    if (badgeWarn) {
      if (warnTire || warnBrake || warnCool) {
        badgeWarn.innerText = '⚠️ AVVISO ATTIVO';
        badgeWarn.style.background = 'rgba(239, 68, 68, 0.2)';
        badgeWarn.style.color = '#ef4444';
        badgeWarn.style.borderColor = 'rgba(239, 68, 68, 0.4)';
      } else {
        badgeWarn.innerText = '✓ SISTEMI OK';
        badgeWarn.style.background = 'rgba(16, 185, 129, 0.15)';
        badgeWarn.style.color = '#10b981';
        badgeWarn.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      }
    }

    const lockSt = this._getState(this._config.lock_entity, 'locked');
    const winClosed = this._getState(this._config.windows_entity, 'on') === 'on';
    const parkBrake = this._getState(this._config.park_brake_entity, 'off') === 'on';
    const isLocked = lockSt === 'locked';
    this._setText('val-sprinter-lock', isLocked ? 'BLOCCATO' : 'SBLOCCATO');
    const elLock = this.shadowRoot.getElementById('val-sprinter-lock');
    if (elLock) elLock.style.color = isLocked ? 'var(--accent-lime)' : 'var(--accent-amber)';
    this._setText('val-sprinter-win-sub', `Vetri: ${winClosed ? 'Chiusi' : 'Aperti'} • Freno: ${parkBrake ? 'ON' : 'OFF'}`);

    // Dedicated Front and Rear Tire Pressures
    const tfl = this._getState(this._config.tire_fl_entity, '--');
    const tfr = this._getState(this._config.tire_fr_entity, '--');
    const trl = this._getState(this._config.tire_rl_entity, '--');
    const trr = this._getState(this._config.tire_rr_entity, '--');
    this._setText('val-tire-fl', tfl);
    this._setText('val-tire-fr', tfr);
    this._setText('val-tire-rl', trl);
    this._setText('val-tire-rr', trr);

    // Slide 7: Diesel Pro & Radar
    const dieselSensor = this._config.diesel_sensor || 'sensor.miglior_prezzo_diesel_van';
    const dieselPrice = this._getState(dieselSensor, '--');
    const dieselAttrs = this._getAttrs(dieselSensor);
    const radarEntity = this._config.radar_switch_entity || 'input_boolean.radar_diesel_attivo';
    const isRadarOn = this._getState(radarEntity, 'off') === 'on';

    this._setText('val-diesel-price', dieselPrice);
    this._setText('val-diesel-currency', dieselAttrs.currency || '€/L');
    this._setText('val-diesel-best-name', dieselAttrs.best_station || 'Nessuna stazione');
    this._setText('val-diesel-best-dist', dieselAttrs.best_distance_km ? `${dieselAttrs.best_distance_km} km dal van` : '-- km');
    this._setText('val-diesel-best-addr', dieselAttrs.best_address || '--');
    this._dieselBestMapsUrl = dieselAttrs.best_maps_url || '';

    // Radar switch display
    const elRadarVal = this.shadowRoot.getElementById('val-diesel-radar-state');
    const elRadarBadge = this.shadowRoot.getElementById('badge-diesel-radar');
    const elRadarSub = this.shadowRoot.getElementById('val-diesel-radar-sub');
    if (elRadarVal) {
      elRadarVal.textContent = isRadarOn ? 'ATTIVO (ON)' : 'SPENTO (OFF)';
      elRadarVal.style.color = isRadarOn ? 'var(--accent-lime)' : 'var(--text-muted)';
    }
    if (elRadarBadge) {
      elRadarBadge.style.background = isRadarOn ? 'rgba(109, 225, 15, 0.2)' : 'rgba(255, 255, 255, 0.08)';
      elRadarBadge.style.color = isRadarOn ? 'var(--accent-lime)' : 'var(--text-muted)';
      elRadarBadge.style.borderColor = isRadarOn ? 'var(--accent-lime)' : 'transparent';
    }
    if (elRadarSub) {
      elRadarSub.textContent = isRadarOn ? 'Avvisi automatici ogni 30m attivi' : 'Tocca per attivare avvisi automatici';
    }

    // Top 2 and 3 stations
    const stations = dieselAttrs.stations || [];
    if (stations.length > 1) {
      const s2 = stations[1];
      this._setText('val-diesel-st2-price', `${s2.price} ${s2.currency || '€'}`);
      this._setText('val-diesel-st2-info', `${s2.name} • ${s2.distance_km} km`);
      this._dieselSt2MapsUrl = s2.maps_url || '';
    } else {
      this._setText('val-diesel-st2-price', '--');
      this._setText('val-diesel-st2-info', 'N/D');
      this._dieselSt2MapsUrl = '';
    }

    if (stations.length > 2) {
      const s3 = stations[2];
      this._setText('val-diesel-st3-price', `${s3.price} ${s3.currency || '€'}`);
      this._setText('val-diesel-st3-info', `${s3.name} • ${s3.distance_km} km`);
      this._dieselSt3MapsUrl = s3.maps_url || '';
    } else {
      this._setText('val-diesel-st3-price', '--');
      this._setText('val-diesel-st3-info', 'N/D');
      this._dieselSt3MapsUrl = '';
    }

    const lastUp = dieselAttrs.last_update ? dieselAttrs.last_update.split(' ')[1] : '--:--';
    this._setText('val-diesel-last-update', `Ultimo: ${lastUp || '--:--'}`);

    // Radius badge on Tile 4
    const curRadius = this._getState(this._config.diesel_radius_entity || 'input_number.raggio_ricerca_diesel', '10');
    this._setText('badge-diesel-radius', `${curRadius} KM`);

    // Dial gauge animation
    const elDialDiesel = this.shadowRoot.getElementById('dial-diesel');
    if (elDialDiesel) {
      elDialDiesel.style.strokeDashoffset = circ * 0.25;
    }

  }

  _setText(id, text) {
    const el = this.shadowRoot.getElementById(id);
    if (el) el.textContent = text;
  }

  getCardSize() {
    return 4;
  }
}

customElements.define('devicedata-cockpit-card-v22', DeviceDataCockpitCardV22);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'devicedata-cockpit-card-v22',
  name: 'DeviceData Cockpit Card V22',
  description: 'DeviceData Cockpit Card V22 with In-Card Controls, GPL Calibration, Swipe & Scrollable Navigation'
});
console.info(`%c DEVICEDATA-COCKPIT-CARD-V22 %c v${CARD_VERSION} `, 'color: #060f18; background: #48d6ff; font-weight: bold;', 'color: #fff; background: #10273a;');

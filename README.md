# 🚐 Genius Van Cockpit & Livella Pro for Home Assistant

Una suite avanzata di **Card Lovelace personalizzate** sviluppate appositamente per **Camper, Vanlife e veicoli ricreazionali** dotati di ecosistemi **Victron Energy, sensori ESPHome, telemetria veicolo e radar carburante europeo**.

Ottimizzata specificamente sia per **tablet a parete / cruscotto (Landscape / Always-On)** con autorotazione automatica delle schermate, sia per **smartphone (iOS / Android)** con swipe orizzontale nativo touch e pop-up modali cyber-style.

---

## ✨ Cosa include il progetto

Il repository include due card JavaScript personalizzate, indipendenti, ad alte prestazioni e a zero dipendenze esterne:

### 1. 🎛️ Genius Van Cockpit Pro (`devicedata-cockpit-card-v22.js` v2.9.0)
Card multifunzione a carosello circolare a 7 schermate con barra di navigazione a scorrimento orizzontale e pop-up interattivi:
* **🔋 Scheda 1 - Batteria Servizi & Avviamento:** Indicatore circolare con percentuale SOC, tensione (V), corrente netta (A), potenza (W), autonomia residua (*Time to go*) e tensione batteria motore.
* **☀️ Scheda 2 - Solare & Alternatore (MPPT + Orion XS):** Monitoraggio produzione fotovoltaica istantanea con stato MPPT e **finestra modale touch di regolazione del limite di corrente del booster Orion XS** (slider continuo + casella numerica + preset rapidi 10A, 20A, 30A, 40A, 50A + interruttore alternatore ON/OFF).
* **⚡ Scheda 3 - Rete 230V & MultiPlus:** Potenza assorbita/erogata in 230V AC, selettore touch delle modalità Inverter (`ON`, `OFF`, `Charger Only`) e **regolazione istantanea del limite colonnina camping** (slider + input numerico + preset rapidi 3A, 4A, 6A, 10A, 16A).
* **🧭 Scheda 4 - Bussola & Altitudine:** Bussola dinamica *Heading-Up* (rotazione fluida a 360° con sagoma van centrale, indicazione cardinale N, NE, E...) e altitudine GPS s.l.m.
* **🔥 Scheda 5 - GPL & Temperature:** Monitoraggio bombola gas con percentuale e kg residui, **finestra modale di calibrazione rapida tara/capacità** integrata direttamente nella tessera, più 4 tessere termiche simmetriche (Dinette, Letto, Bagno, Esterno) con allarmi colore automatici in base a soglie termiche.
* **🚚 Scheda 6 - Dati Veicolo (Mercedes Sprinter / Camper):** Indicatore AdBlue ad alta visibilità, livello carburante compatto con autonomia residua (km), stato e sblocco/blocco portiere touch e **monitoraggio pressione pneumatici TPMS dedicato ruota per ruota** (Ant SX/DX e Post SX/DX in bar).
* **⛽ Scheda 7 - Diesel Pro & Radar in Viaggio (Novità v2.9):** 
  - **Hero Gauge 1° Miglior Prezzo:** Mostra in grande il prezzo più basso trovato nei paraggi in EUR/L con nome distributore, distanza dal van, indirizzo e tocco diretto per aprire Google Maps con navigazione turn-by-turn.
  - **Interruttore Radar in Viaggio:** Badge touch ON/OFF per governare gli avvisi automatici periodici lungo il tragitto senza distrazioni alla guida.
  - **2° e 3° Alternativa Economica:** Tessere comparative con prezzi, distanze e link rapido a Maps.
  - **Tessera Raggio & Cerca con Pop-up Modale Completo:** Toccando la tessera si apre il pannello modale con:
    * **Frequenza di Rilevazione Personalizzabile:** Slider continuo (5-60 min), input libero e **tasti rapidi preset (`5'`, `10'`, `15'`, `20'`, `30'`)** per scegliere l'intervallo degli avvisi.
    * **Raggio di Ricerca (km):** Slider continuo (5-100 km), input libero e **tasti rapidi preset (`5 km`, `10 km`, `15 km`, `20 km`, `30 km`, `50 km`, `100 km`)**.
    * **Pulsante `[🔍 CERCA ORA SUL POSTO]`:** con animazione visiva istantanea di caricamento.
  - **Copertura Multi-Paese Europea:** Supporto nativo per Italia (MIMIT), Germania (MTS-K / Tankerkönig), Austria (E-Control), Svizzera (Comparis / TCS), Slovenia (Goriva.si), Francia, Spagna, Portogallo, Scandinavia (Circle K / OKQ8 / Uno-X / Neste / ANWB) e Regno Unito.

### 2. 🎯 Livella Van Pro (`genius-van-livella-card.js` v1.0.0)
Card visuale per il livellamento del furgone/camper in sosta:
* **Bersaglio Circolare 2D (Bullseye):** Bolla fluida al neon con anelli concentrici (0.5°, 1.5°, 3.0°) che si colora di verde quando il mezzo è a livello.
* **Sagoma Van Top-Down:** Sagoma vettoriale stilizzata del furgone orientata frontalmente.
* **Calcolo Cunei Ruote in cm:** Mostra per ciascuna delle 4 ruote l'altezza esatta (in cm) necessaria per mettere in bolla il veicolo.
* **Rilevamento Ruota a Terra:** Evidenzia automaticamente la ruota di riferimento a terra con badge verde (*"0.0 cm • A TERRA"*).
* **Pulsante Taratura Zero:** Pulsante rapido integrato per azzerare e calibrare la posizione orizzontale in un tocco.

---

## 📁 Struttura del Repository

```text
├── www/
│   ├── devicedata-cockpit-card-v22.js   # Card Cockpit Pro v2.9.0 (7 Schede)
│   └── genius-van-livella-card.js       # Card Livella Pro v1.0.0
├── examples/
│   ├── cockpit-card-pro.yaml            # Configurazione YAML Cockpit con Diesel Pro
│   ├── livella-card-pro.yaml            # Configurazione YAML Livella
│   └── dashboard-lovelace-view.yaml     # Esempio vista completa Lovelace
├── LICENSE                              # Doppia Licenza (Uso Personale Gratuito / Commerciale a Pagamento)
├── MANUALE_INTEGRAZIONE_HA_VAN.md       # Dossier Tecnico Completo Impianto Van
└── README.md                            # Documentazione del progetto
```

---

## 🚀 Guida all'Installazione

### Passo 1: Copia dei file JavaScript
1. Accedi alla cartella di configurazione del tuo Home Assistant (tramite Samba, SSH, Studio Code Server o File Editor).
2. Entra nella cartella `config/www/` (se non esiste la cartella `www`, creala).
3. Copia i file presenti nella cartella `www/` di questo repository:
   - `devicedata-cockpit-card-v22.js`
   - `genius-van-livella-card.js`

### Passo 2: Registrazione delle Risorse in Home Assistant
1. Vai su Home Assistant: **Impostazioni** ➔ **Dashboard** ➔ Menu in alto a destra (3 puntini) ➔ **Risorse**.
2. Registra o aggiorna la risorsa per la Cockpit Card:
   - **URL:** `/local/devicedata-cockpit-card-v22.js?v=3.1`
   - **Tipo di risorsa:** `Modulo JavaScript`
3. Registra la risorsa per la Livella:
   - **URL:** `/local/genius-van-livella-card.js?v=1.0`
   - **Tipo di risorsa:** `Modulo JavaScript`
4. Salva e ricarica la pagina del browser (o svuota la cache della Home Assistant Companion App con uno swipe verso il basso).

### Passo 3: Inserimento delle Card nella Dashboard
1. Vai sulla tua Dashboard Lovelace, clicca su **Modifica plancia**.
2. Scegli **Aggiungi scheda** ➔ scorri in fondo e seleziona **Manuale**.
3. Incolla il codice YAML desiderato prendendolo dai file nella cartella `examples/`:
   - Per il Cockpit: `examples/cockpit-card-pro.yaml`
   - Per la Livella: `examples/livella-card-pro.yaml`
4. Sostituisci i nomi delle entità con quelli del tuo impianto.

---

## ⚙️ Mappatura e Personalizzazione delle Entità

Tutte le entità sono completamente configurabili nel file YAML. Se non disponi di alcuni sensori, puoi ometterli; la card si adatterà graficamente nascondendo o visualizzando segnaposto discreti.

### Entità principali Cockpit:
| Parametro | Descrizione | Integrazione tipica |
|---|---|---|
| `soc_entity` | Stato di carica batteria % | Victron SmartShunt / BMV / Cerbo GX |
| `voltage_entity` | Tensione batteria servizi (V) | Victron SmartShunt / BMV |
| `current_entity` | Corrente netta (A) | Victron SmartShunt / BMV |
| `pv_power_entity` | Potenza solare fotovoltaica (W) | Victron SmartSolar MPPT |
| `orion_current_limit_entity` | Regolazione corrente booster (A) | Victron Orion XS DC-DC |
| `orion_switch_entity` | Interruttore booster alternatore | Victron Orion XS DC-DC |
| `multiplus_power_entity` | Potenza 230V AC (W) | Victron MultiPlus |
| `multiplus_mode_entity` | Modalità operativa inverter/charger | Victron MultiPlus |
| `multiplus_current_limit_entity` | Limite colonnina camping (A) | Victron MultiPlus |
| `heading_entity` | Prua bussola (0-360°) | ESPHome / GPS NMEA |
| `altitude_entity` | Altitudine GPS (m) | ESPHome / Sensore GPS |
| `gpl_percent_entity` | Livello bombola gas (%) | Sensore ultrasuoni Mopeka / Cella di carico |
| `adblue_entity` | Livello AdBlue veicolo (%) | Mercedes Me / Telemetria OBD |
| `tire_fl_entity` .. `rr` | Pressione 4 gomme (bar) | Sensori TPMS BLE / Telemetria van |
| `diesel_sensor` | Sensore miglior prezzo diesel | Script Python `van_diesel_finder.py` / `ha-fuelprices` |
| `radar_switch_entity` | Switch Radar in Viaggio ON/OFF | `input_boolean.radar_diesel_attivo` |
| `diesel_radius_entity` | Raggio di ricerca (km) | `input_number.raggio_ricerca_diesel` |
| `diesel_freq_entity` | Frequenza temporale radar (min) | `input_number.frequenza_radar_diesel` |

---

## 💡 Doppia Modalità di Ricerca Carburante Diesel
1. **Ricerca Puntuale (Spot):** Seleziona il raggio con i tasti rapidi (`5, 10, 15, 20, 30, 50, 100 km`) e premi **"Cerca Ora"** per interrogare istantaneamente le pompe attorno alla posizione attuale del van.
2. **Radar in Viaggio (Automatico):** Attiva **"Radar in Viaggio" (ON)**: durante la marcia, esegue scansioni automatiche alla frequenza scelta (`5', 10', 15', 20', 30'` min) attorno alle coordinate GPS live del mezzo (entro il raggio impostato) e invia una notifica push interattiva su smartphone per avviare il navigatore Google Maps verso la pompa più conveniente.

---

## 📜 Licenza

Questo progetto è protetto da copyright ed è distribuito sotto modello di **Doppia Licenza (Dual Licensing)**:

* 🟢 **Uso Personale / Privato (Gratuito):** Libero e gratuito per qualsiasi privato cittadino, camperista o appassionato DIY per l'installazione e la personalizzazione sul proprio veicolo ricreazionale.
* 🔴 **Uso Commerciale / Professionale (A Pagamento):** È **espressamente vietato** utilizzare, integrare, preinstallare o distribuire questo software (o parti di esso) nell'ambito di attività commerciali, allestimenti camper/van conto terzi, vendita di kit preconfezionati o servizi a pagamento senza aver preventivamente acquistato una **regolare licenza commerciale** concordata con l'autore Piero.

Per consultare i termini completi o richiedere una licenza commerciale, consulta il file [LICENSE](LICENSE) o contatta l'autore tramite le Issue/Discussions di GitHub.

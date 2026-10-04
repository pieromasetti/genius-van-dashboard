# 🚐 Genius Van Cockpit & Livella Pro for Home Assistant

Una suite avanzata di **Card Lovelace personalizzate** sviluppate appositamente per **Camper, Vanlife e veicoli ricreazionali** dotati di ecosistemi **Victron Energy, sensori ESPHome e telemetria veicolo**.

Ottimizzata specificamente sia per **tablet a parete (Landscape / Always-On)** con autorotazione automatica delle schermate, sia per **smartphone (iOS / Android)** con swipe orizzontale nativo touch.

---

## ✨ Cosa include il progetto

Il repository include due card JavaScript personalizzate, indipendenti e leggere:

### 1. 🎛️ Genius Van Cockpit Pro (`devicedata-cockpit-card-v22.js` v2.7.0)
Card multifunzione a carosello circolare con selettore rapido in basso:
* **🔋 Scheda 1 - Batteria Servizi & Avviamento:** Indicatore circolare con percentuale SOC, tensione (V), corrente netta (A), potenza (W), autonomia residua (*Time to go*) e tensione batteria motore.
* **☀️ Scheda 2 - Solare & Alternatore (MPPT + Orion XS):** Monitoraggio produzione fotovoltaica istantanea con stato MPPT e **regolazione diretta del limite di corrente del booster Orion XS** (slider touch rapido + casella per digitare il valore numerico esatto).
* **⚡ Scheda 3 - Rete 230V & MultiPlus:** Potenza assorbita/erogata in 230V AC, selettore touch delle modalità Inverter (`ON`, `OFF`, `Charger Only`) e **regolazione istantanea del limite colonnina camping** (slider + input numerico).
* **🧭 Scheda 4 - Bussola & Altitudine:** Bussola dinamica *Heading-Up* (rotazione fluida a 360° con indicazione cardinale N, NE, E...) e altitudine GPS s.l.m.
* **🔥 Scheda 5 - GPL & Temperature:** Monitoraggio bombola gas con percentuale e kg residui, **finestra modale di calibrazione rapida tara/capacità** integrata direttamente nella tessera, più 4 tessere termiche simmetriche (Dinette, Letto, Bagno, Esterno) con allarmi colore automatici in base a soglie termiche.
* **🚚 Scheda 6 - Dati Veicolo (Mercedes Sprinter / Camper):** Indicatore AdBlue ad alta visibilità, livello carburante compatto con autonomia residua (km), stato e sblocco/blocco portiere touch e **monitoraggio pressione pneumatici TPMS dedicato ruota per ruota** (Ant SX/DX e Post SX/DX in bar).

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
│   ├── devicedata-cockpit-card-v22.js   # Card Cockpit Pro v2.7.0
│   └── genius-van-livella-card.js       # Card Livella Pro v1.0.0
├── examples/
│   ├── cockpit-card-pro.yaml            # Configurazione YAML Cockpit
│   ├── livella-card-pro.yaml            # Configurazione YAML Livella
│   └── dashboard-lovelace-view.yaml     # Esempio vista completa Lovelace
├── LICENSE                              # Licenza MIT (Open Source)
└── README.md                            # Guida all'installazione
```

---

## 🚀 Guida all'Installazione

### Passo 1: Copia dei file JavaScript
1. Accedi alla cartella di configurazione del tuo Home Assistant (tramite Samba, SSH, Studio Code Server o File Editor).
2. Entra nella cartella `config/www/` (se non esiste la cartella `www`, creala).
3. Copia i due file presenti nella cartella `www/` di questo repository:
   - `devicedata-cockpit-card-v22.js`
   - `genius-van-livella-card.js`

### Passo 2: Registrazione delle Risorse in Home Assistant
1. Vai su Home Assistant: **Impostazioni** ➔ **Dashboard** ➔ Menu in alto a destra (3 puntini) ➔ **Risorse**.
2. Clicca su **Aggiungi Risorsa** per la prima card:
   - **URL:** `/local/devicedata-cockpit-card-v22.js?v=2.7`
   - **Tipo di risorsa:** `Modulo JavaScript`
3. Clicca di nuovo su **Aggiungi Risorsa** per la seconda card:
   - **URL:** `/local/genius-van-livella-card.js?v=1.0`
   - **Tipo di risorsa:** `Modulo JavaScript`
4. Salva e ricarica la pagina del browser (o svuota la cache della Home Assistant Companion App).

### Passo 3: Inserimento delle Card nella Dashboard
1. Vai sulla tua Dashboard Lovelace, clicca su **Modifica plancia**.
2. Scegli **Aggiungi scheda** ➔ scorri in fondo e seleziona **Manuale**.
3. Incolla il codice YAML desiderato prendendolo dai file nella cartella `examples/`:
   - Per il Cockpit: `examples/cockpit-card-pro.yaml`
   - Per la Livella: `examples/livella-card-pro.yaml`
4. Sostituisci i nomi delle entità con quelli del tuo impianto (es. i tuoi sensori Victron o ESPHome).

---

## ⚙️ Mappatura e Personalizzazione delle Entità

Tutte le entità sono completamente configurabili nel file YAML. Se non disponi di alcuni sensori (ad esempio il sensore AdBlue o la bombola GPL), puoi ometterli o impostarli su sensori fittizi; la card si adatterà graficamente.

### Entità principali Cockpit:
| Parametro | Descrizione | Integrazione tipica |
|---|---|---|
| `soc_entity` | Stato di carica batteria % | Victron SmartShunt / BMV / Cerbo GX |
| `voltage_entity` | Tensione batteria servizi (V) | Victron SmartShunt / BMV |
| `current_entity` | Corrente netta (A) | Victron SmartShunt / BMV |
| `pv_power_entity` | Potenza solare fotovoltaica (W) | Victron SmartSolar MPPT |
| `orion_current_limit_entity` | Regolazione corrente booster (A) | Victron Orion XS DC-DC |
| `multiplus_power_entity` | Potenza 230V AC (W) | Victron MultiPlus |
| `multiplus_current_limit_entity` | Limite colonnina camping (A) | Victron MultiPlus |
| `heading_entity` | Prua bussola (0-360°) | ESPHome / GPS NMEA |
| `altitude_entity` | Altitudine GPS (m) | ESPHome / Sensore GPS |
| `gpl_percent_entity` | Livello bombola gas (%) | Sensore ultrasuoni Mopeka / Cella di carico |
| `adblue_entity` | Livello AdBlue veicolo (%) | Mercedes Me / Telemetria OBD |
| `tire_fl_entity` .. `rr` | Pressione 4 gomme (bar) | Sensori TPMS BLE / Telemetria van |

### Entità principali Livella:
| Parametro | Descrizione | Note |
|---|---|---|
| `pitch_entity` | Inclinazione asse longitudinale (°) | Sensore IMU (es. MPU6050 su ESPHome) |
| `roll_entity` | Inclinazione asse trasversale (°) | Sensore IMU (es. MPU6050 su ESPHome) |
| `wedge_fl/fr/rl/rr_entity` | Cunei ruote (cm) | Calcolo automatico in base al passo ruote |
| `calibrate_button` | Tasto calibrazione zero | Invia comando di offset al sensore |

---

## 💡 Suggerimento per l'uso su Tablet e Smartphone
- **Tablet da incasso / cruscotto:** Imposta la vista Lovelace in modalità **Pannello (1 scheda)** (`panel: true`) per una resa a pieno schermo identica a un computer di bordo automobilistico OEM.
- **Autorotazione:** Il parametro `cycle_interval: 12` fa scorrere le schermate ogni 12 secondi. Se tocchi lo schermo per interagire (es. regolare l'Orion o il MultiPlus), la rotazione si mette in pausa per non disturbare l'operazione.

---

## 📜 Licenza
Rilasciato sotto licenza [MIT](LICENSE). Sentiti libero di utilizzare, modificare e condividere questo progetto per il tuo camper o per la community!

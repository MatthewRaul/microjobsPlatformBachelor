# JobY

JobY este o platformă web pentru microjoburi locale, dezvoltată ca lucrare de licență. Permite utilizatorilor să publice joburi pe termen scurt în zona lor, să aplice la joburile altora și să lase recenzii după finalizarea colaborării. Aplicația oferă autentificare securizată, autocomplete de localități din România, notificări automate pe email și un panel de administrare pentru gestionarea utilizatorilor, joburilor, aplicărilor și recenziilor.

## Tehnologii folosite

**Backend**
- Java 17, Spring Boot 3.x
- Spring Security + JWT (autentificare stateless)
- Spring Data MongoDB
- Spring Mail (notificări pe email)
- Maven

**Frontend**
- React + Vite
- React Router
- Axios

**Bază de date**
- MongoDB Atlas

**Servicii externe**
- GeoNames API (autocomplete localități din România)
- Gmail SMTP (trimitere email-uri)

## Structură proiect

```
microjobsPlatformBachelor/
├── src/                # backend Spring Boot
├── frontend/           # aplicație React (Vite)
├── pom.xml
└── mvnw / mvnw.cmd     # Maven Wrapper
```

## Cerințe preliminare

- Java 17 sau mai nou
- Node.js 18+ și npm
- Cont MongoDB Atlas (sau o instanță MongoDB locală)
- Cont Gmail cu parolă de aplicație generată (pentru SMTP)
- Cont gratuit GeoNames (pentru API username)

## Configurare

Backend-ul citește la pornire un fișier `.env`, plasat în rădăcina proiectului (lângă `pom.xml`), care nu este inclus în repo din motive de securitate.

Creează un fișier `.env` cu următorul conținut:

```env
MONGODB_URI=mongodb+srv://<user>:<parola>@<cluster>.mongodb.net/<nume_baza_date>
JWT_SECRET=<un_string_lung_si_aleator_pentru_semnarea_token-urilor>
USERNAME_GEO=<username-ul_tau_de_pe_geonames.org>
SMTP_PASSWORD=<parola_de_aplicatie_gmail>
```

Detalii despre fiecare variabilă:

| Variabilă | Descriere |
|---|---|
| `MONGODB_URI` | Connection string către clusterul MongoDB Atlas |
| `JWT_SECRET` | Cheie secretă folosită pentru semnarea token-urilor JWT |
| `USERNAME_GEO` | Username-ul de pe [geonames.org](https://www.geonames.org), necesar pentru autocomplete-ul de localități |
| `SMTP_PASSWORD` | Parola de aplicație Gmail folosită pentru trimiterea email-urilor (nu parola contului) |

## Rulare backend

Din rădăcina proiectului:

```bash
./mvnw spring-boot:run
```

Pe Windows:

```bash
mvnw.cmd spring-boot:run
```

Backend-ul pornește implicit pe `http://localhost:8080`.

## Rulare frontend

Din folderul `frontend/`:

```bash
cd frontend
npm install
npm run dev
```

Frontend-ul pornește implicit pe `http://localhost:5173` și comunică cu backend-ul pe portul `8080`.

## Pornire completă

1. Pornește backend-ul (`./mvnw spring-boot:run`)
2. Pornește frontend-ul (`npm run dev` din `frontend/`)
3. Accesează `http://localhost:5173` în browser

## Funcționalități principale

- Înregistrare și autentificare utilizatori (JWT)
- Publicare, editare și ștergere joburi
- Aplicare la joburi disponibile
- Acceptare/respingere aplicări de către proprietarul jobului
- Notificări automate pe email pentru evenimente importante (aplicare nouă, acceptare, respingere, anulare job)
- Autocomplete pentru localități din România (GeoNames)
- Recenzii și rating între utilizatori
- Panel de administrare (gestionare utilizatori, joburi, aplicări, recenzii)


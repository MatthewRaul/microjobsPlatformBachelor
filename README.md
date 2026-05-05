Această aplicație reprezintă tema lucrării mele de licență și constă într-o platformă web de microjoburi, realizată ca aplicație full-stack, cu backend în Spring Boot și frontend separat în React. Scopul ei este să faciliteze interacțiunea dintre utilizatorii care postează sarcini de scurtă durată și utilizatorii care doresc să aplice la acestea, într-un flux apropiat de o aplicație web modernă, cu autentificare, operații protejate, reguli de business și integrare reală între interfață și API.
Fluxul general al aplicației este următorul:
•	utilizatorii își pot crea cont și se pot autentifica;
•	un utilizator autentificat poate publica joburi;
•	utilizatorii pot vizualiza joburile disponibile și pot aplica la ele;
•	utilizatorul care a postat jobul poate vedea aplicanții și îi poate accepta sau respinge;
•	utilizatorul autentificat își poate vizualiza propriile aplicări;
•	utilizatorul care a creat un job îl poate edita, anula, finaliza sau șterge;
•	atunci când capacitatea unui job este atinsă, jobul este marcat ca plin și nu mai poate primi aplicări noi;
•	în plus, a fost începută integrarea unui sistem de autocomplete pentru localitate, bazat pe căutare de orașe și asocierea lor cu județul.
Tehnologii
Tehnologiile folosite în proiect sunt:
•	Backend: Spring Boot.
•	Frontend: React, în proiect separat, conectat la backend prin API.
•	Baza de date: MongoDB Atlas, conform arhitecturii discutate în descrierea proiectului.
•	Securitate: Spring Security + JWT, cu autentificare stateless și endpoint-uri protejate.
•	HTTP client frontend: Axios, pentru conectarea interfeței la backend.
•	Build tool: Maven, pentru partea de backend.
•	Version control: Git + GitHub, repository privat.
Stadiul curent
În acest moment, partea principală de funcționalitate este implementată și testată pentru fluxurile esențiale ale aplicației: autentificare, creare job, listare joburi, detalii job, aplicare, listarea aplicărilor proprii și gestionarea aplicanților de către owner. Backend-ul conține logică de business pentru validări și restricții, iar frontend-ul în React este conectat efectiv la aceste endpoint-uri și permite folosirea fluxurilor principale într-o interfață funcțională.
Accentul principal a fost pus până acum pe finalizarea logicii și pe stabilizarea fluxurilor funcționale, nu pe forma finală a interfeței. Interfața este deja utilizabilă, dar urmează să fie rafinată din punct de vedere vizual, iar unele zone sunt încă în proces de verificare și curățare.
Realizat până acum
Până în acest moment au fost realizate următoarele:
•	structurarea aplicației pe backend și frontend separat;
•	implementarea autentificării cu register, login și endpoint pentru utilizatorul logat;
•	configurarea securității cu JWT și protejarea operațiilor sensibile;
•	implementarea modulului de joburi: creare, listare, detalii, editare, anulare, finalizare și ștergere;
•	implementarea modulului de aplicări: aplicare la job, listarea aplicanților pentru un job, acceptare, respingere și listarea aplicărilor proprii;
•	integrarea frontend-backend pentru aceste fluxuri, prin pagini și apeluri API dedicate;
•	implementarea regulilor de business pentru ownership, aplicare unică și blocarea aplicării la joburi indisponibile;
•	implementarea mecanismului de capacitate, prin care un job devine FILLED când se atinge numărul maxim de locuri;
•	integrarea în frontend a informațiilor despre capacitate și a mesajelor pentru joburi pline;
•	începerea și corectarea logicii de autocomplete pentru localitate și județ în formularul de adăugare job, astfel încât utilizatorul să poată selecta corect localitatea și județul asociat.
Modul utilizatori și autentificare
A fost implementat modulul de utilizatori și autentificare, incluzând cont nou, login și încărcarea datelor utilizatorului autentificat. Endpoint-ul GET /api/users/me este disponibil și returnează datele utilizatorului logat, ceea ce permite frontend-ului să diferențieze comportamentul în funcție de cine este conectat.
În frontend, autentificarea este integrată astfel încât utilizatorul logat să poată accesa paginile și acțiunile protejate. Acest lucru este important, fiindcă în aplicație există roluri funcționale diferite: utilizator care publică joburi și utilizator care aplică la joburi.
Securitate
Partea de securitate este implementată cu JWT și Spring Security, într-un mod stateless. Endpoint-urile publice și cele protejate sunt separate clar, iar operațiile care modifică date sau țin de contul utilizatorului necesită token valid.
În forma actuală, sunt publice în special register, login, listarea joburilor și detaliile unui job. Sunt protejate operațiile precum creare job, editare, ștergere, aplicare, acceptare/respingere aplicări și vizualizarea aplicărilor proprii.
Modul joburi
Modulul de joburi acoperă operațiile principale necesare unei platforme de microjoburi: creare, listare, detalii, editare, anulare, finalizare și ștergere. Pentru aceste operații există reguli de ownership, astfel încât doar utilizatorul care a postat jobul să îl poată modifica sau administra.
În plus, a fost implementată logica de capacitate:
•	fiecare job are un număr de locuri necesare;
•	există un contor pentru locurile ocupate;
•	când numărul aplicanților acceptați ajunge la capacitate, jobul este marcat ca FILLED;
•	după ce devine plin, jobul nu mai poate primi aplicări noi.
Asta se poate înțelege simplu ca la un autobuz: dacă ai 10 locuri și toate sunt ocupate, nu mai urcă nimeni.
Modul aplicări
Modulul de aplicări este una dintre cele mai importante părți deja funcționale ale proiectului. El permite trimiterea unei aplicări la un job, listarea aplicanților pentru jobul respectiv, acceptarea sau respingerea lor și vizualizarea aplicărilor proprii ale unui utilizator.
Regulile de business implementate aici sunt clare:
•	un utilizator nu poate aplica la propriul job;
•	un utilizator nu poate aplica de două ori la același job;
•	nu se poate aplica la un job anulat, completat sau deja plin;
•	doar owner-ul jobului poate vedea aplicările acelui job;
•	doar aplicările cu status PENDING pot fi acceptate sau respinse;
•	când o aplicare este acceptată, crește acceptedWorkers, iar dacă se atinge capacitatea, jobul devine FILLED;
În plus, în implementarea actuală, atunci când jobul devine plin în urma unei acceptări, aplicările rămase în PENDING sunt respinse automat. Asta face fluxul mai coerent și previne situațiile în care rămân cereri „în aer” la un job care nu mai are locuri.
Structura aplicației
Proiectul backend este organizat modular, pe straturi separate precum controller, service, repository, model, DTO, security și exception. Această organizare este potrivită pentru un REST API în Spring Boot, deoarece separă clar responsabilitățile între nivelul HTTP, logica de business, persistență și tratarea erorilor.
În frontend, structura este separată pe pagini, API calls, context de autentificare și componente reutilizabile. Asta a permis integrarea fluxurilor principale și începutul unor componente mai avansate, cum este autocomplete-ul pentru localitate.
Endpoint-uri disponibile
În acest moment, endpoint-urile confirmate în documentația existentă sunt:
Publice
•	POST /api/users/register
•	POST /api/users/login
•	GET /api/jobs
•	GET /api/jobs/{id}
Protejate
•	GET /api/users/me
•	POST /api/jobs
•	PATCH /api/jobs/{id}
•	PATCH /api/jobs/{id}/cancel
•	PATCH /api/jobs/{id}/complete
•	DELETE /api/jobs/{id}
•	POST /api/jobs/{jobId}/apply
•	GET /api/aplicari/me
•	GET /api/jobs/{jobId}/aplicari
•	PATCH /api/aplicari/{aplicareId}/accept
•	PATCH /api/aplicari/{aplicareId}/reject
Probleme identificate și rezolvate
Pe parcursul implementării au fost identificate și rezolvate mai multe probleme:
•	probleme de conectare și configurare între backend și baza de date;
•	probleme de integrare frontend-backend, inclusiv trimiterea tokenului pentru request-uri protejate;
•	probleme în fluxul de login și reîncărcarea utilizatorului logat;
•	clarificarea logicii pentru acceptedWorkers, neededWorkers și statusul FILLED;
•	validarea scenariilor-limită pentru aplicări și ownership;
•	o problemă recentă în componenta de autocomplete pentru localitate, unde se afișa și se selecta invers relația dintre oraș și județ;
•	verificarea frontend-ului a arătat că LocationAutocomplete și locationApi.js transmiteau corect datele mai departe, ceea ce a dus la concluzia că problema era în datele primite din backend sau în maparea lor;
•	în final, problema a fost rezolvată și selecția localitate-județ funcționează corect.
Ce s-a făcut recent în frontend
În frontend există deja pagini funcționale pentru fluxurile principale ale aplicației, inclusiv listare joburi, autentificare, creare job, editare, detalii job, aplicări proprii, joburile proprii și profil. Aceste pagini sunt folosite activ pentru testarea logicii și pentru verificarea integrării cu backend-ul.
Recent, o zonă importantă pe partea de formular a fost îmbunătățită prin adăugarea unei componente de autocomplete pentru localitate. Aici s-a lucrat pe afișarea sugestiilor, transmiterea obiectului selectat și corectarea relației dintre location și county, astfel încât în formular să se salveze corect orașul și județul.
Ce urmează
În perioada următoare, urmează în principal:
•	verificarea finală a tuturor regulilor de business și a scenariilor-limită;
•	rafinarea UI-ului și a CSS-ului pentru paginile deja funcționale;
•	afișarea mai clară a mesajelor de succes și eroare în interfață;
•	testare end-to-end pentru toate fluxurile principale;
•	eventuală extindere a modulului de profil;
•	adăugarea unui sistem de review/rating după finalizarea unui job, ca extensie ulterioară.



Această aplicație reprezintă tema lucrării mele de licență și constă într-o platformă web de microjoburi. Scopul ei este să faciliteze interacțiunea dintre utilizatorii care postează sarcini de scurtă durată și utilizatorii care doresc să aplice pentru acestea, într-un flux apropiat de o aplicație web modernă, cu autentificare, listare de conținut, pagini de detalii și operații protejate.
Fluxul general al aplicației este următorul:
•	utilizatorii își pot crea cont și se pot autentifica;
•	un utilizator autentificat poate publica microjoburi;
•	utilizatorii pot vizualiza joburile disponibile și pot aplica la ele;
•	utilizatorul care a postat jobul poate vedea aplicanții și îi poate accepta sau respinge;
•	utilizatorul autentificat își poate vizualiza propriile aplicări;
•	atunci când capacitatea unui job este atinsă, jobul este marcat ca plin și nu mai poate primi aplicări noi;
•	ulterior poate fi adăugat un sistem de review/rating după finalizarea colaborării.
________________________________________
Tehnologii folosite
•	Backend: Spring Boot 3.5.12.
•	Frontend: React, cu proiect separat și integrare funcțională cu backend-ul.
•	Baza de date: MongoDB Atlas.
•	Securitate: Spring Security + JWT, în mod stateless, fără sesiuni server-side.
•	HTTP client frontend: Axios, pentru conectarea React la API-ul backend.
•	Build tool: Maven.
•	Version control: Git + GitHub, repository privat.
•	Editor folosit: Visual Studio Code.
________________________________________
Stadiul curent al proiectului
În acest moment, backend-ul acoperă fluxurile principale ale aplicației și a fost testat pentru operațiile esențiale de autentificare, joburi și aplicări. Proiectul este organizat modular, pe straturi separate de controller, service, repository, model, DTO, security și exception, ceea ce reprezintă o structură corectă pentru un REST API dezvoltat cu Spring Boot.
Frontend-ul în React nu mai este doar inițializat, ci este conectat efectiv la backend-ul existent. Sunt deja funcționale paginile de autentificare, listarea joburilor, crearea unui job, pagina de detalii pentru job și principalele acțiuni din fluxul de aplicare, inclusiv diferențierea dintre owner și applicant.
În momentul actual, accentul a fost pus pe funcționalitate, nu pe design final. Interfața urmează să fie rafinată ulterior, după stabilizarea completă a fluxurilor principale și a tuturor scenariilor de utilizare.
________________________________________
Realizat până acum
Inițializare și configurare proiect
Până în acest moment au fost realizate următoarele:
•	crearea proiectului backend cu Spring Initializr;
•	configurarea aplicației pe Spring Boot 3.5.12;
•	conectarea backend-ului la MongoDB Atlas;
•	rezolvarea problemelor de conectare la Atlas, inclusiv whitelist-ul de IP și corectarea connection string-ului cu numele bazei de date;
•	pornirea cu succes a backend-ului;
•	inițializarea repository-ului Git și conectarea la un repository privat GitHub;
•	inițializarea separată a proiectului frontend în React;
•	organizarea structurii frontend pe foldere dedicate pentru pagini, context, apeluri API și componente.
Structura backend
Proiectul backend a fost organizat pe pachete separate:
•	controller
•	service
•	repository
•	model
•	dto
•	security
•	exception
Această organizare respectă ideea unei arhitecturi pe straturi, în care controller-ele gestionează request-urile HTTP, service-urile conțin logica de business, repository-urile comunică cu baza de date, modelele definesc entitățile persistente, iar DTO-urile controlează datele schimbate între backend și client.
________________________________________
Modul utilizatori și autentificare
A fost implementat modulul de utilizatori și autentificare, incluzând:
•	entitatea User;
•	enum-ul Role cu valorile USER și ADMIN;
•	clasele UserRepository, UserService, UserController, CustomUserDetailsService;
•	endpoint-ul de register cu validare pentru email unic și telefon unic;
•	criptarea parolelor cu BCrypt;
•	login-ul pe bază de email și parolă;
•	DTO-urile LoginRequest și LoginResponse;
•	generarea tokenului JWT la autentificare;
•	endpoint-ul privat GET /api/users/me;
•	integrarea autentificării în frontend prin AuthContext;
•	salvarea tokenului JWT în frontend și reutilizarea lui pentru endpoint-urile protejate.
Fluxul de login este funcțional atât în backend, cât și în frontend. După autentificare, utilizatorul logat este reîncărcat în interfață pe baza tokenului, iar datele sale sunt folosite pentru diferențierea comportamentului în pagini precum Home și Job Details.
În plus, a fost început și modulul de profil, astfel încât utilizatorul autentificat să își poată vedea propriile date și să existe bază pentru extinderea ulterioară a profilului public și a editării profilului. Endpoint-ul GET /api/users/me este funcțional și returnează în prezent datele utilizatorului logat.
________________________________________
Securitate
Partea de securitate a fost implementată în mod stateless, folosind JWT și Spring Security. Au fost realizate:
•	configurarea clasei SecurityConfig;
•	definirea regulilor de acces pentru endpoint-urile publice și protejate;
•	configurarea autentificării bazate pe CustomUserDetailsService;
•	implementarea filtrului JWT pentru extragerea și validarea tokenului din header-ul Authorization;
•	validarea tokenului pe endpoint-urile protejate;
•	integrarea autentificării în frontend prin Axios.
În forma actuală:
•	register, login, GET /api/jobs și GET /api/jobs/{id} sunt accesibile public;
•	endpoint-urile pentru creare job, aplicare, acceptare, respingere, anulare, finalizare și vizualizarea datelor proprii necesită token JWT valid.
________________________________________
Gestionarea variabilelor sensibile
Pentru dezvoltarea locală, variabilele sensibile au fost mutate în .env, iar aplicația a fost configurată pentru a le citi corect. Au fost rezolvate probleme legate de parsing, configurare și interpretare a valorilor sensibile. Această separare între cod și configurație reprezintă o practică bună pentru dezvoltare și întreținere.
________________________________________
Modul joburi
A fost implementat modulul de joburi, incluzând:
•	entitatea Job;
•	enum-ul JobStatus;
•	DTO-ul CreateJobRequest;
•	clasele JobRepository, JobService, JobController;
•	endpoint-ul POST /api/jobs pentru creare job;
•	endpoint-ul GET /api/jobs pentru listare publică;
•	endpoint-ul GET /api/jobs/{id} pentru detalii job;
•	endpoint-urile PATCH /api/jobs/{id}/cancel și PATCH /api/jobs/{id}/complete;
•	logica de ownership, astfel încât doar utilizatorul care a postat jobul să poată modifica starea acestuia.
În acest modul a fost introdus și mecanismul de capacitate:
•	fiecare job are un număr de locuri necesare (neededWorkers);
•	a fost adăugat și contorul de locuri ocupate (acceptedWorkers);
•	în interfață se afișează acum raportul dintre locurile ocupate și capacitatea totală;
•	atunci când numărul de aplicanți acceptați ajunge la capacitatea setată, jobul este marcat ca FILLED.
În frontend, listarea publică a joburilor este deja conectată la backend, iar formularul de creare job funcționează pentru utilizatorul autentificat. De asemenea, pagina de detalii pentru job este implementată și consumă endpoint-ul real de detaliu.
________________________________________
Modul aplicări
A fost implementat și modulul de aplicări, incluzând:
•	entitatea Aplicare;
•	enum-ul AplicareStatus;
•	AplicareRepository;
•	AplicareService;
•	AplicareController;
•	endpoint-ul POST /api/jobs/{jobId}/apply pentru trimiterea unei aplicări la un job;
•	endpoint-ul GET /api/jobs/{jobId}/aplicari pentru vizualizarea aplicanților unui job;
•	endpoint-urile PATCH /api/aplicari/{aplicareId}/accept și PATCH /api/aplicari/{aplicareId}/reject;
•	endpoint-ul GET /api/aplicari/me pentru vizualizarea propriilor aplicări.
Prin acest modul, aplicația acoperă interacțiunea principală dintre cele două tipuri de utilizatori:
•	utilizatorul care postează jobul;
•	utilizatorul care aplică la job.
În frontend au fost deja integrate următoarele:
•	aplicarea la job din Home și din pagina de detalii;
•	diferențierea dintre joburile proprii și joburile altor utilizatori;
•	afișarea aplicanților în pagina de detalii pentru owner;
•	acțiuni de acceptare și respingere din interfață pentru aplicările aflate în PENDING;
•	verificarea faptului că un utilizator nu poate aplica de două ori la același job, pe baza endpoint-ului GET /api/aplicari/me și a verificărilor din backend.
De asemenea, au fost clarificate și testate scenariile în care:
•	owner-ul nu poate aplica la propriul job;
•	un utilizator nu poate aplica din nou dacă are deja o aplicare la acel job;
•	un job plin nu mai poate primi aplicări noi;
________________________________________
Tratarea erorilor
Pentru a avea răspunsuri mai clare și controlate din backend, a fost implementată o zonă dedicată tratării erorilor:
•	clasa ApiError;
•	excepțiile custom BadRequest, ForbiddenAction, ResourceNotFound;
•	GlobalExceptionHandler pentru centralizarea răspunsurilor de eroare.
Această abordare face API-ul mai predictibil și mai ușor de consumat din frontend, deoarece erorile apar într-un format coerent și pot fi tratate mai ușor în interfață.
________________________________________
Structura curentă backend
Structura actuală a proiectului backend este următoarea:
text
src/main/java/com/licenta/microjobsPlatform/controller
src/main/java/com/licenta/microjobsPlatform/service
src/main/java/com/licenta/microjobsPlatform/repository
src/main/java/com/licenta/microjobsPlatform/model
src/main/java/com/licenta/microjobsPlatform/dto
src/main/java/com/licenta/microjobsPlatform/security
src/main/java/com/licenta/microjobsPlatform/exception
src/main/resources
pom.xml
.env
________________________________________
Clase create
Auth / user
•	model/User.java
•	model/Role.java
•	repository/UserRepository.java
•	service/UserService.java
•	service/CustomUserDetailsService.java
•	controller/UserController.java
•	dto/LoginRequest.java
•	dto/LoginResponse.java
•	security/SecurityConfig.java
•	security/JwtService.java
•	security/JwtAuthenticationFilter.java
Job
•	model/Job.java
•	model/JobStatus.java
•	repository/JobRepository.java
•	service/JobService.java
•	controller/JobController.java
•	dto/CreateJobRequest.java
Aplicări
•	model/Aplicare.java
•	model/AplicareStatus.java
•	repository/AplicareRepository.java
•	service/AplicareService.java
•	controller/AplicareController.java
Erori
•	dto/ApiError.java
•	exception/BadRequest.java
•	exception/ForbiddenAction.java
•	exception/ResourceNotFound.java
•	exception/GlobalExceptionHandler.java
Frontend
•	api/authApi.js
•	api/axios.js
•	api/jobApi.js
•	context/AuthContext.jsx
•	pages/HomePage.jsx
•	pages/LoginPage.jsx
•	pages/RegisterPage.jsx
•	pages/AddJobPage.jsx
•	pages/JobDetailsPage.jsx
________________________________________
Funcționalități implementate și testate
Autentificare și utilizatori
•	register utilizator cu validare email unic și telefon unic;
•	login utilizator cu generare token JWT;
•	roluri USER și ADMIN;
•	criptarea parolei cu BCrypt;
•	validare token JWT pe endpoint-uri protejate;
•	endpoint privat /api/users/me funcțional;
•	integrarea login-ului în frontend prin React și salvarea tokenului JWT;
•	reîncărcarea utilizatorului logat în frontend pe baza tokenului salvat.
Joburi
•	creare job cu utilizator autentificat;
•	listare publică joburi;
•	detalii job după ID;
•	anulare job de către owner;
•	finalizare job de către owner;
•	control de ownership pentru acțiuni sensibile;
•	afișarea joburilor în frontend;
•	afișarea detaliilor principale în cardurile din interfață, inclusiv descriere, status, capacitate, locuri ocupate, salariu și interval temporal;
•	diferențiere în interfață între joburile proprii și cele ale altor utilizatori;
•	afișarea unui meniu contextual pentru joburile proprii în pagina principală;
•	afișarea mesajului specific atunci când un job este plin.
Aplicări
•	aplicare la job de către utilizator autentificat;
•	blocarea aplicării la propriul job;
•	blocarea dublei aplicări la același job;
•	listarea aplicărilor pentru un job;
•	acceptarea sau respingerea aplicanților de către owner;
•	actualizarea numărului de locuri ocupate după acceptare;
•	trecerea jobului în FILLED atunci când se atinge capacitatea;
•	vizualizarea propriilor aplicări prin endpoint-ul /api/aplicari/me;
•	integrarea fluxului de aplicare în frontend atât în Home, cât și în pagina de detalii.
________________________________________
Endpoint-uri disponibile în acest moment
Publice
•	POST /api/users/register
•	POST /api/users/login
•	GET /api/jobs
•	GET /api/jobs/{id}
Protejate
•	GET /api/users/me
•	POST /api/jobs
•	PATCH /api/jobs/{id}/cancel
•	PATCH /api/jobs/{id}/complete
•	POST /api/jobs/{jobId}/apply
•	GET /api/aplicari/me
•	GET /api/jobs/{jobId}/aplicari
•	PATCH /api/aplicari/{aplicareId}/accept
•	PATCH /api/aplicari/{aplicareId}/reject
________________________________________
Probleme identificate și rezolvate
Până acum au fost identificate și rezolvate mai multe probleme tehnice:
•	conectare la MongoDB Atlas afectată de schimbarea IP-ului public, rezolvată prin whitelist în Network Access;
•	URI MongoDB incomplet, rezolvat prin adăugarea numelui bazei de date;
•	variabile de mediu necitite corect din .env, rezolvate prin configurarea explicită a citirii lor;
•	erori de parsing în .env, rezolvate prin corectarea formatului KEY=VALUE;
•	probleme de conectare și configurare la backend în faza inițială;
•	probleme de integrare frontend-backend cauzate de lipsa header-ului Authorization în request-urile protejate, rezolvate prin configurarea corectă a instanței Axios;
•	erori în fluxul de login și reîncărcare a utilizatorului logat în frontend, corectate în procesul de integrare;
•	erori de frontend legate de apeluri greșite și variabile nedefinite în logica de aplicare la job, corectate pe parcurs;
•	clarificarea și corectarea logicii pentru acceptedWorkers și pentru corelarea dintre capacitatea jobului și statusul FILLED;
•	clarificarea modului în care frontend-ul verifică dacă utilizatorul a aplicat deja, folosind GET /api/aplicari/me și câmpul jobId.
________________________________________
Ce s-a început între timp
Pe lângă backend, a fost inițializată și partea de frontend în React, într-un proiect separat, cu structură de bază pentru:
•	api
•	components
•	context
•	pages
•	styles
Au fost deja începute și conectate paginile principale necesare fluxului de bază:
•	Home;
•	Login;
•	Register;
•	Add Job;
•	Job Details.
În acest moment, aceste pagini nu sunt încă finisate din punct de vedere vizual, dar sunt folosite activ pentru testarea și stabilizarea fluxurilor funcționale.
________________________________________
Ce urmează să fie făcut
Backend
•	verificarea finală și stabilizarea logicii din AplicareService, astfel încât fluxul de acceptare să rămână consistent în toate scenariile-limită;
•	revizuirea finală a regulilor de securitate pentru endpoint-urile care sunt momentan mai permisive decât ar trebui;
•	finalizarea completă a modulului de profil utilizator;
•	implementarea editării joburilor existente;
•	eventual separarea mai clară între profil propriu și profil public.
Frontend
•	finalizarea logicii din Home pentru ascunderea/dezactivarea corectă a acțiunii de aplicare atunci când utilizatorul a aplicat deja sau când jobul este plin;
•	finalizarea aceleiași logici în pagina de detalii pentru job;
•	implementarea paginii pentru aplicările proprii;
•	implementarea paginii pentru joburile proprii;
•	completarea acțiunilor owner-ului din interfață;
•	testarea completă end-to-end între React și Spring Boot pentru toate fluxurile importante;
•	după stabilizarea completă a funcționalității, rafinarea interfeței și a designului.
Extensii ulterioare
•	sistem simplu de review/rating după finalizarea unui job;
•	validări suplimentare în frontend;
•	îmbunătățiri de UI/UX după încheierea părții funcționale.


Această aplicație reprezintă tema lucrării mele de licență și constă într-o platformă web de microjoburi. Scopul ei este să faciliteze interacțiunea dintre utilizatorii care postează sarcini de scurtă durată și utilizatorii care doresc să aplice pentru acestea, într-un flux apropiat de o aplicație modernă cu autentificare, listare de conținut, pagini de detalii și operații protejate.
Fluxul general al aplicației este următorul:
•	utilizatorii își pot crea cont și se pot autentifica;
•	un utilizator autentificat poate publica microjoburi;
•	utilizatorii pot vizualiza joburile disponibile și pot aplica la ele;
•	utilizatorul care a postat jobul poate vedea aplicanții și îi poate accepta sau respinge;
•	ulterior poate fi adăugat un sistem de review/rating după finalizarea colaborării.
________________________________________
Tehnologii folosite
•	Backend: Spring Boot 3.5.12.
•	Frontend: React, aflat în faza de inițializare și structurare.
•	Baza de date: MongoDB Atlas.
•	Securitate: Spring Security + JWT, în mod stateless, adică fără sesiuni server-side.
•	Build tool: Maven.
•	Version control: Git + GitHub, repository privat.
•	Editor folosit: Visual Studio Code.
________________________________________
Stadiul curent al proiectului
În acest moment, partea de backend este implementată în proporție mare la nivel de funcționalități principale și a fost testată în Postman pentru fluxurile esențiale. Proiectul are deja o structură modulară clară, bazată pe separarea responsabilităților între controller, service, repository, model, DTO, security și exception, ceea ce reprezintă o abordare corectă pentru un backend Spring Boot de tip REST API.
Frontend-ul în React a fost început la nivel de structură de proiect și urmează să fie dezvoltat peste endpoint-urile deja existente, ceea ce este o ordine firească de lucru pentru o aplicație full-stack, deoarece UI-ul va consuma API-uri reale și deja testate.
________________________________________
Realizat până acum
Inițializare și configurare proiect
Până în acest moment au fost realizate următoarele:
•	crearea proiectului backend cu Spring Initializr;
•	configurarea aplicației pe Spring Boot 3.5.12;
•	conectarea backend-ului la MongoDB Atlas;
•	rezolvarea problemelor de conectare la Atlas, inclusiv whitelist-ul de IP și corectarea connection string-ului cu numele bazei de date;
•	pornirea cu succes a backend-ului;
•	inițializarea repository-ului Git și conectarea la un repository privat GitHub.
________________________________________
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
•	testarea completă în Postman pentru fluxul register → login → token → /me.
În plus, a fost început și modulul de profil, astfel încât utilizatorul autentificat să își poată vedea propriile date și să existe bază pentru extinderea ulterioară a profilului public și a editării profilului.
________________________________________
Securitate
Partea de securitate a fost implementată în mod stateless, folosind JWT și Spring Security. Au fost realizate:
•	configurarea clasei SecurityConfig;
•	definirea regulilor de acces pentru endpoint-urile publice și protejate;
•	configurarea AuthenticationProvider cu DaoAuthenticationProvider;
•	implementarea filtrului JwtAuthenticationFilter pentru extragerea și validarea tokenului din header-ul Authorization;
•	validarea tokenului pe endpoint-urile protejate;
•	integrarea autentificării bazate pe CustomUserDetailsService.
În forma actuală:
•	register, login și endpoint-urile publice de listare/detaliu job sunt accesibile fără autentificare;
•	restul endpoint-urilor relevante pentru acțiuni sensibile necesită token JWT valid.
________________________________________
Gestionarea variabilelor sensibile
Pentru dezvoltarea locală, variabilele sensibile au fost mutate în .env, iar aplicația a fost configurată pentru a le citi corect. Au fost rezolvate:
•	erori de parsing în fișierul .env;
•	probleme de configurare a valorilor sensibile;
•	situații în care variabilele nu erau interpretate corect de aplicație.
Această separare între cod și configurație sensibilă este o practică bună pentru dezvoltare și întreținere.
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
•	logica de ownership, astfel încât doar utilizatorul care a postat jobul să poată modifica starea acestuia;
•	filtrarea listării publice astfel încât să fie afișate doar joburile relevante, active și vizibile;
•	testarea completă în Postman pentru create, get all, get by id, cancel și complete.
Acest modul acoperă deja fluxul principal prin care un utilizator autentificat publică un microjob, iar ceilalți utilizatori îl pot vedea public.
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
•	fluxul prin care owner-ul jobului poate accepta sau respinge aplicanți;
•	endpoint-ul pentru vizualizarea propriilor aplicări de către utilizatorul autentificat;
•	testarea completă a flow-ului în Postman.
Prin acest modul, aplicația acoperă deja interacțiunea de bază dintre cele două roluri funcționale din sistem: cel care postează jobul și cel care aplică.
________________________________________
Tratarea erorilor
Pentru a avea răspunsuri mai clare și mai controlate din backend, a fost implementată o zonă dedicată tratării erorilor:
•	clasa ApiError;
•	excepțiile custom BadRequest, ForbiddenAction, ResourceNotFound;
•	GlobalExceptionHandler pentru centralizarea răspunsurilor de eroare.
Această abordare face API-ul mai predictibil și mai ușor de consumat din frontend, deoarece erorile nu mai apar ca răspunsuri generice, ci într-un format coerent.
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
________________________________________
Funcționalități implementate și testate
Autentificare și utilizatori
•	register utilizator cu validare email unic și telefon unic;
•	login utilizator cu generare token JWT;
•	roluri USER și ADMIN;
•	criptarea parolei cu BCrypt;
•	răspuns 409 Conflict pentru cont duplicat;
•	validare token JWT pe endpoint-uri protejate;
•	endpoint privat /api/users/me funcțional și testat.
Joburi
•	creare job cu utilizator autentificat;
•	listare publică joburi;
•	detalii job după ID;
•	anulare job de către owner;
•	finalizare job de către owner;
•	control de ownership pentru acțiuni sensibile;
•	ascunderea joburilor neactive din listarea publică.
Aplicări
•	aplicare la job de către utilizator autentificat;
•	listarea aplicărilor pentru un job;
•	acceptarea sau respingerea aplicanților de către owner;
•	vizualizarea propriilor aplicări;
•	testarea completă a flow-ului în Postman.
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
•	endpoint-urile pentru acceptarea și respingerea aplicărilor
•	endpoint-ul pentru vizualizarea propriilor aplicări
________________________________________
Probleme identificate și rezolvate
Până acum au fost identificate și rezolvate mai multe probleme tehnice:
•	conectare la MongoDB Atlas afectată de schimbarea IP-ului public, rezolvată prin whitelist în Network Access;
•	URI MongoDB incomplet, rezolvat prin adăugarea numelui bazei de date;
•	variabile de mediu necitite corect din .env, rezolvate prin configurarea explicită a citirii lor;
•	erori de parsing în .env, rezolvate prin corectarea formatului KEY=VALUE;
•	eroare DNS/SRV la conectarea către Atlas, rezolvată prin corectarea URI-ului;
•	metodă duplicată isTokenValid în JwtService, eliminată;
•	import greșit pentru JwtService, corectat;
•	apel greșit static pe jwtService, corectat;
•	request greșit în Postman pentru GET /api/jobs/{id}, corectat prin folosirea ID-ului direct în URL;
•	eroare MalformedJwtException apărută în testare, identificată ca fiind cauzată de token trimis greșit și rezolvată prin utilizarea unui token valid.
________________________________________
Ce s-a început între timp
Pe lângă backend, a fost inițializată și partea de frontend în React, într-un proiect separat, cu structură de bază pentru:
•	api
•	components
•	context
•	pages
•	styles
Această organizare este potrivită pentru continuarea dezvoltării frontend-ului peste API-ul existent și permite o separare clară între pagini, componente reutilizabile, logică de autentificare și apeluri către backend.
________________________________________
Ce urmează să fie făcut
Următorii pași logici pentru continuarea proiectului sunt:
Backend
•	finalizarea completă a modulului de profil utilizator;
•	definirea clară a răspunsului pentru profil public vs. profil propriu;
•	revizuirea finală a regulilor de securitate pentru endpoint-urile GET permise public;
•	tratarea mai robustă a excepțiilor generate de tokenuri invalide în filtrul JWT;
•	implementarea editării joburilor existente;
•	actualizarea automată a statusului jobului în funcție de deciziile asupra aplicanților;
•	pregătirea backend-ului pentru integrare completă cu frontend-ul.
Frontend
•	configurarea aplicației React cu routing și structură de bază;
•	implementarea paginilor Home, Login, Register;
•	conectarea frontend-ului la backend prin Axios;
•	implementarea autentificării în frontend și stocarea tokenului JWT;
•	protejarea rutelor care necesită autentificare;
•	implementarea paginilor pentru listare joburi, detalii job, creare job și aplicare;
•	implementarea paginilor pentru profil, aplicările proprii și joburile proprii;
•	testarea completă end-to-end între React și Spring Boot.
Extensii ulterioare
•	sistem simplu de review/rating după finalizarea unui job;
•	eventuale îmbunătățiri de UI/UX și validări suplimentare în frontend;
•	rafinarea controlului de acces pe anumite endpoint-uri și scenarii limită


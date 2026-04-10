Această aplicație reprezintă tema lucrării mele de licență și constă într-o platformă web de microjoburi. Fluxul general păstrează logica unei aplicații cu home, autentificare, listare, detalii și adăugare de conținut, dar este adaptat pentru interacțiuni între utilizatori care postează joburi și utilizatori care aplică la acestea.

Ideea principală a aplicației este următoarea:

utilizatorii își pot crea cont și se pot autentifica;

un utilizator autentificat poate posta microjoburi;

un utilizator poate vedea joburile disponibile și poate aplica la ele;

utilizatorul care a postat jobul poate vedea aplicanții și îi poate accepta sau respinge;

ulterior poate fi adăugat un sistem de review/rating după finalizarea colaborării.

Tehnologii folosite
Backend: Spring Boot 3.5.12.

Frontend: React, urmează să fie dezvoltat.

Baza de date: MongoDB Atlas.

Securitate: Spring Security + JWT, configurare stateless.

Build tool: Maven.

Version control: Git + GitHub, repository privat.

Editor: Visual Studio Code.

Stadiul curent al proiectului
Realizat până acum
Până în acest moment au fost implementate și testate următoarele componente și funcționalități:

Inițializare și configurare proiect
crearea proiectului backend cu Spring Initializr;

configurarea aplicației Spring Boot pe versiunea 3.5.12;

conectarea backend-ului la MongoDB Atlas;

rezolvarea problemelor de conectare la Atlas, inclusiv whitelist-ul de IP și corectarea connection string-ului cu numele bazei de date;

pornirea cu succes a backend-ului;

inițializarea repository-ului Git și conectarea la un repository privat GitHub.

Structura backend
organizarea proiectului pe pachete: controller, service, repository, model, dto, security, exception;

definirea structurii de bază pentru dezvoltarea modulară a backend-ului.

Modul utilizatori și autentificare
crearea entității User;

definirea enum-ului Role cu valorile USER și ADMIN;

implementarea claselor UserRepository, UserService, UserController, CustomUserDetailsService;

implementarea endpoint-ului de register cu validare pentru email unic și telefon unic;

implementarea criptării parolelor cu BCrypt;

implementarea login-ului pe bază de email și parolă;

crearea DTO-urilor LoginRequest și LoginResponse;

generarea tokenului JWT la autentificare;

implementarea endpoint-ului privat GET /api/users/me;

testarea completă în Postman pentru fluxul register -> login -> token -> /me.

Securitate
implementarea SecurityConfig în mod stateless;

configurarea regulilor de acces astfel încât register, login și GET /api/jobs/** să fie publice, iar restul endpoint-urilor să necesite autentificare;

configurarea AuthenticationProvider cu DaoAuthenticationProvider;

implementarea filtrului JwtAuthenticationFilter pentru extragerea și validarea tokenului din header-ul Authorization;

validarea tokenului JWT pe endpoint-urile protejate.

Gestionarea variabilelor sensibile
mutarea variabilelor sensibile în .env pentru dezvoltare locală;

configurarea aplicației pentru citirea acestora;

rezolvarea erorilor de parsing și de configurare a valorilor sensibile.

Modul joburi
implementarea entității Job;

definirea enum-ului JobStatus;

crearea DTO-ului CreateJobRequest;

implementarea claselor JobRepository, JobService, JobController;

implementarea endpoint-ului POST /api/jobs pentru creare job;

implementarea endpoint-ului GET /api/jobs pentru listare publică a joburilor vizibile;

implementarea endpoint-ului GET /api/jobs/{id} pentru detalii job;

implementarea endpoint-urilor PATCH /api/jobs/{id}/cancel și PATCH /api/jobs/{id}/complete;

implementarea logicii de ownership, astfel încât doar utilizatorul care a postat jobul poate modifica starea acestuia;

filtrarea listării publice astfel încât joburile vizibile să fie doar cele cu status OPEN și FILLED;

testarea completă în Postman pentru create, get all, get by id, cancel și complete.

Modul aplicări
implementarea entității Aplicare;

definirea enum-ului AplicareStatus;

crearea AplicareRepository;

implementarea AplicareService;

crearea AplicareController;

implementarea endpoint-ului POST /api/jobs/{jobId}/apply pentru trimiterea unei aplicări la un job;

implementarea endpoint-ului GET /api/jobs/{jobId}/aplicari pentru vizualizarea aplicanților unui job;

implementarea fluxului prin care owner-ul jobului poate accepta sau respinge aplicanți;

implementarea endpoint-ului pentru vizualizarea propriilor aplicări de către utilizatorul autentificat;

testarea completă în Postman pentru flow-ul de aplicare, listare aplicări, acceptare și respingere.

Tratarea erorilor
adăugarea clasei ApiError;

crearea excepțiilor custom BadRequest, ForbiddenAction, ResourceNotFound;

implementarea unui GlobalExceptionHandler pentru răspunsuri de eroare mai clare și mai controlate;

Configurare backend
fișier principal de configurare: src/main/resources/application.properties;

aplicația rulează pe portul 8080;

backend-ul este conectat la MongoDB Atlas cu connection string complet;

Spring Security este configurat stateless, cu JWT;

tokenul JWT este generat și validat corect;

parolele sunt salvate hash-uit cu BCrypt;

variabilele sensibile sunt folosite din .env în mediul local.

Structura curentă backend
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
Clase create
Auth / user
model/User.java

model/Role.java

repository/UserRepository.java

service/UserService.java

service/CustomUserDetailsService.java

controller/UserController.java

dto/LoginRequest.java

dto/LoginResponse.java

security/SecurityConfig.java

security/JwtService.java

security/JwtAuthenticationFilter.java

Job
model/Job.java

model/JobStatus.java

repository/JobRepository.java

service/JobService.java

controller/JobController.java

dto/CreateJobRequest.java

Aplicări
model/Aplicare.java

model/AplicareStatus.java

repository/AplicareRepository.java

service/AplicareService.java

controller/AplicareController.java

Erori
dto/ApiError.java

exception/BadRequest.java

exception/ForbiddenAction.java

exception/ResourceNotFound.java

exception/GlobalExceptionHandler.java

Funcționalități implementate și testate
Autentificare și utilizatori
register utilizator cu validare email unic și telefon unic;

login utilizator cu generare token JWT;

roluri USER și ADMIN;

criptarea parolei cu BCrypt;

răspuns 409 Conflict pentru cont duplicat;

validare token JWT pe endpoint-uri protejate;

endpoint privat /me funcțional și testat.

Joburi
creare job cu utilizator autentificat;

listare publică joburi;

detalii job după ID;

anulare job de către owner;

finalizare job de către owner;

control de ownership pentru acțiuni sensibile;

ascunderea joburilor neactive din listarea publică.

Aplicări
aplicare la job de către utilizator autentificat;

listarea aplicărilor pentru un job;

acceptarea sau respingerea aplicanților de către owner;

vizualizarea propriilor aplicări;

testarea completă a flow-ului în Postman.

Endpoint-uri disponibile în acest moment
Publice
POST /api/users/register

POST /api/users/login

GET /api/jobs

GET /api/jobs/{id}

Protejate
GET /api/users/me

POST /api/jobs

PATCH /api/jobs/{id}/cancel

PATCH /api/jobs/{id}/complete

POST /api/jobs/{jobId}/apply

endpoint-urile pentru acceptarea și respingerea aplicărilor;

endpoint-ul pentru vizualizarea propriilor aplicări.

Probleme identificate și rezolvate
problemă de conectare la MongoDB Atlas din cauza schimbării IP-ului public, rezolvată prin whitelist în Network Access;

URI MongoDB Atlas incomplet, rezolvat prin adăugarea numelui bazei de date;

variabile de mediu necitite corect din .env, rezolvate prin configurarea explicită a citirii lor;

eroare de parsing în .env, rezolvată prin corectarea formatului KEY=VALUE;

eroare DNS/SRV la conectarea către Atlas, rezolvată prin corectarea URI-ului;

metodă duplicată isTokenValid în JwtService, eliminată;

import greșit pentru JwtService, corectat;

apel greșit static pe jwtService, corectat;

request greșit în Postman pentru GET /api/jobs/{id}, corectat prin folosirea ID-ului direct în URL;

eroare JWT de tip MalformedJwtException apărută în testare, identificată ca fiind cauzată de token trimis greșit în request și rezolvată prin folosirea unui token valid;

Ce urmează să fie făcut
Următorii pași logici pentru continuarea proiectului sunt:

stabilizarea finală a backend-ului pentru flow-ul de aplicări și revizuirea regulilor de securitate pentru endpoint-urile de tip GET care momentan sunt permise prin regula generală GET /api/jobs/**;

îmbunătățirea filtrului JWT prin tratarea mai robustă a excepțiilor generate de tokenuri invalide;

implementarea profilului de utilizator;

editarea joburilor existente;

actualizarea automată a statusului jobului în funcție de numărul de aplicanți acceptați;

implementarea unui sistem simplu de review/rating după finalizarea unui job;

dezvoltarea frontend-ului în React;

conectarea frontend-ului cu backend-ul și testarea completă end-to-end.

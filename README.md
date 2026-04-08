Această aplicație reprezintă tema lucrării mele de licență și constă într-o platformă web de microjoburi. Fluxul general rămâne inspirat din schema inițială bazată pe home, login/register, listare, detalii și adăugare conținut, adaptată pentru microjoburi și interacțiuni între utilizatori care postează joburi și utilizatori care aplică la ele.

Ideea principală
Utilizatorii își pot crea cont.

Un utilizator poate posta microjoburi.

Un utilizator poate vedea joburile și poate aplica la ele.

Utilizatorul care a postat jobul poate accepta sau respinge aplicanți.

Ulterior se poate adăuga sistem de review/rating.

Aplicația păstrează logica inițială în care utilizatorul logat poate adăuga conținut propriu sau poate interacționa cu conținutul altor utilizatori.

Tehnologii folosite
Backend: Spring Boot 3.5.12

Frontend: React, urmează să fie creat

Baza de date: MongoDB Atlas

Securitate: Spring Security + JWT complet implementat și testat

Build tool: Maven

Version control: Git + GitHub, repository privat

Editor: Visual Studio Code

Stadiu curent al proiectului
Realizat până acum:

crearea proiectului backend cu Spring Initializr

configurarea Spring Boot pe versiunea 3.5.12

conectarea cu MongoDB Atlas

rezolvarea problemei de conectare la Atlas cauzată de schimbarea IP-ului public și whitelist-ul din Network Access

rezolvarea problemei cu URI-ul MongoDB Atlas (lipsea numele bazei de date din connection string)

pornirea cu succes a backend-ului

inițializarea repository-ului Git

crearea unui repository privat pe GitHub

primul push al proiectului

crearea structurii de bază a backend-ului pe pachete

crearea entității User

definirea enum-ului Role cu valorile USER și ADMIN

crearea UserRepository, UserService, UserController, CustomUserDetailsService

implementarea endpoint-ului de register cu validare email unic și telefon unic

testarea register-ului în Postman

configurarea PasswordEncoder cu BCrypt și hash-uirea parolei la înregistrare

implementarea login-ului pe bază de email + parolă

crearea DTO-urilor LoginRequest și LoginResponse (fără parolă în răspuns)

tratarea duplicatelor la register cu răspuns 409 Conflict

curățarea colecției users din MongoDB pentru retestare corectă

adăugarea structurii JWT: JwtService, JwtAuthenticationFilter, CustomUserDetailsService

conectarea login-ului la AuthenticationManager și generarea tokenului JWT în UserService

modificarea LoginResponse pentru a include token, firstName, email și role

finalizarea SecurityConfig în formă stateless:

register, login și GET /api/jobs/** pe permitAll()

restul endpoint-urilor pe authenticated()

sessionCreationPolicy(STATELESS)

addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

authenticationProvider configurat corect cu DaoAuthenticationProvider

implementarea și testarea completă a endpoint-ului privat /me:

GET /api/users/me cu token valid -> 200 + firstName, email, role

GET /api/users/me fără token -> 401 Unauthorized

testarea completă a fluxului JWT în Postman:

register -> 201 Created

login -> 200 + token JWT

login greșit -> 401

register duplicat -> 409 Conflict

/me cu token -> 200

/me fără token -> 401

mutarea cheilor sensibile în fișier .env pentru dezvoltare locală

configurarea aplicației pentru citirea variabilelor din .env

rezolvarea erorii de parsing din .env cauzată de o intrare scrisă greșit

implementarea entității Job

crearea enum-ului JobStatus

crearea DTO-ului CreateJobRequest

crearea JobRepository, JobService, JobController

implementarea endpoint-ului POST /api/jobs pentru creare job

implementarea endpoint-ului GET /api/jobs pentru listare publică joburi

implementarea endpoint-ului GET /api/jobs/{id} pentru detalii job

implementarea endpoint-ului PATCH /api/jobs/{id}/cancel

implementarea endpoint-ului PATCH /api/jobs/{id}/complete

implementarea logicii de ownership: doar utilizatorul care a postat jobul poate da cancel sau complete

filtrarea listării publice astfel încât joburile CANCELED și COMPLETED să nu mai apară în lista activă

testarea completă în Postman pentru create, get all, get by id, cancel și complete

Configurare backend
Fișier principal: src/main/resources/application.properties

aplicația rulează pe portul 8080

backend-ul este conectat la MongoDB Atlas (connection string complet cu nume bază de date)

Spring Security configurat final, stateless, cu JWT

JWT: generare token, validare token, filtru JWT — toate funcționale și testate

parole salvate hash-uit cu BCrypt

pentru dezvoltare locală: variabilele sensibile sunt mutate în .env și folosite în configurația aplicației

Structura curentă backend
text
src/main/java/com/licenta/microjobsPlatform/controller
src/main/java/com/licenta/microjobsPlatform/service
src/main/java/com/licenta/microjobsPlatform/repository
src/main/java/com/licenta/microjobsPlatform/model
src/main/java/com/licenta/microjobsPlatform/dto
src/main/java/com/licenta/microjobsPlatform/security
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

Funcționalități implementate și testate
Autentificare și user
register utilizator cu validare email unic și telefon unic

login utilizator cu generare token JWT

roluri: USER și ADMIN

criptarea parolei cu BCrypt

răspuns 409 Conflict pentru cont duplicat

generare token JWT la login

validare token JWT pe endpoint-uri protejate

endpoint privat /me funcțional și testat

Joburi
creare job cu utilizator autentificat

listare publică joburi

detalii job după id

anulare job (cancel) de către owner

finalizare job (complete) de către owner

control de ownership pentru acțiuni sensibile

ascunderea joburilor CANCELED și COMPLETED din listarea publică

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

Probleme identificate și rezolvate
problemă de conectare la MongoDB Atlas din cauza schimbării IP-ului public -> rezolvată prin whitelist în Network Access

useri vechi salvați neuniform în baza de date -> baza curățată pentru retestare

URI MongoDB Atlas fără numele bazei de date -> adăugat numele bazei în connection string

variabile de mediu JWT_SECRET și MONGODB_URI necitite automat din .env de Spring Boot -> integrată soluția pentru citirea .env

eroare de parsing în .env (Malformed entry) -> rezolvată prin corectarea formatului KEY=VALUE

eroare DNS/SRV la conectarea Atlas -> rezolvată prin corectarea URI-ului complet

metodă duplicată isTokenValid în JwtService -> eliminată

import greșit JwtService în UserController după refactor -> corectat spre pachetul security

apel static în loc de instanță pe jwtService în UserController -> corectat

request greșit în Postman pentru GET /api/jobs/{id} -> corectat prin folosirea id-ului direct în URL, nu în body

Funcționalități planificate — MVP licență
profil utilizator

editare job

aplicare la job

acceptare / respingere aplicant

status job automat în funcție de aplicanți

review simplu după finalizare

după stabilizarea backend-ului -> începerea frontend-ului în React

Ce urmează — următorii pași concreți
Următorul pas este implementarea fluxului de aplicare la job:

un user poate aplica la un job postat de alt user

poster-ul poate vedea lista aplicanților

poster-ul poate accepta sau respinge aplicanți

statusul jobului se poate actualiza automat în funcție de locurile disponibile

după stabilizarea backend-ului pe partea de apply flow -> începerea frontend-ului în React

Context pentru thread următor
Dacă acest proiect este continuat într-un alt thread, contextul de pornire este:

proiect licență: platformă web de microjoburi

backend creat în Spring Boot 3.5.12, funcțional și pornit cu succes

MongoDB Atlas conectat și funcțional, connection string complet cu numele bazei de date

problema de whitelist IP pentru Atlas rezolvată

Git și GitHub configurate, repository privat existent

structura backend completă pe pachete

entitatea User creată, enum Role cu USER și ADMIN

UserRepository, UserService, UserController, CustomUserDetailsService create și funcționale

register și login funcționează și au fost testate în Postman

parolele sunt salvate hash-uit cu BCrypt

DTO-urile LoginRequest și LoginResponse există

JwtService, JwtAuthenticationFilter create și funcționale

SecurityConfig este în forma finală stateless, complet configurată

fluxul JWT este complet testat: register -> login -> token -> /me -> 200, fără token -> 401

endpoint-ul /me există în UserController și funcționează corect

variabilele sensibile sunt mutate în .env pentru dezvoltare locală

entitatea Job este implementată

JobStatus, CreateJobRequest, JobRepository, JobService, JobController sunt create și funcționale

endpoint-urile POST /api/jobs, GET /api/jobs, GET /api/jobs/{id}, PATCH /api/jobs/{id}/cancel, PATCH /api/jobs/{id}/complete sunt implementate și testate în Postman

logica de ownership pentru joburi este implementată

următorul pas este implementarea aplicării la job și a gestionării aplicanților

Update făcut în 9 aprilie 2026

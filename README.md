Context actualizat proiect licență – platformă web de microjoburi
Această aplicație reprezintă tema lucrării mele de licență și constă într-o platformă web de microjoburi. Fluxul general rămâne inspirat din schema inițială bazată pe home, login/register, listare, detalii și adăugare conținut, adaptată pentru microjoburi și interacțiuni între utilizatori care postează joburi și utilizatori care aplică la ele.
​

Ideea principală
Utilizatorii își pot crea cont.

Un utilizator poate posta microjoburi.

Un utilizator poate vedea joburile și poate aplica la ele.

Utilizatorul care a postat jobul poate accepta sau respinge aplicanți.

Ulterior se poate adăuga sistem de review/rating.

Aplicația păstrează logica inițială în care utilizatorul logat poate adăuga conținut propriu sau poate interacționa cu conținutul altor utilizatori.
​

Tehnologii folosite
Backend: Spring Boot 3.5.12.
​

Frontend: React, urmează să fie creat.

Baza de date: MongoDB Atlas.

Securitate: Spring Security + structură JWT deja adăugată în backend.

Build tool: Maven.

Version control: Git + GitHub, repository privat.

Editor: Visual Studio Code.

Stadiu curent al proiectului
Până acum am realizat:

crearea proiectului backend cu Spring Initializr;

configurarea Spring Boot pe versiunea 3.5.12;

conectarea cu MongoDB Atlas;

rezolvarea unei probleme de conectare la Atlas cauzată de schimbarea IP-ului public și whitelist-ul din Network Access;

pornirea cu succes a backend-ului;

inițializarea repository-ului Git;

crearea unui repository privat pe GitHub;

primul push al proiectului;

crearea structurii de bază a backend-ului pe pachete;

crearea entității User;
​

definirea enum-ului Role;
​

alegerea modelului de roluri USER și ADMIN;
​

crearea UserRepository;
​

crearea UserService;
​

crearea UserController;
​

implementarea endpoint-ului de register;

implementarea validării pentru email și număr de telefon deja existente;
​

testarea register-ului în Postman;

configurarea unui PasswordEncoder cu BCrypt;
​

hash-uirea parolei la înregistrare;
​

implementarea unui login pe bază de email + parolă;

crearea DTO-urilor LoginRequest și LoginResponse;

modificarea login-ului astfel încât să nu mai returneze parola;

tratarea duplicate-urilor la register cu răspuns 409 Conflict;
​

curățarea colecției users din MongoDB pentru a elimina userii vechi/inconsistenți și a retesta flow-ul de la zero;

adăugarea structurii JWT în backend: JwtService, JwtAuthenticationFilter, CustomUserDetailsService;

conectarea login-ului la AuthenticationManager și generarea tokenului JWT în UserService;
​

modificarea LoginResponse pentru a include token, firstName, email și role;
​

configurarea unei versiuni temporare de SecurityConfig pentru diagnostic și testare.
​

Configurare backend
Fișier principal de configurare:

src/main/resources/application.properties

Configurare actuală:

aplicația rulează pe portul 8080;

backend-ul este conectat la MongoDB Atlas;

există configurare Spring Security personalizată;
​

există componente JWT create: generare token, validare token și filtru JWT;

endpoint-urile de register și login există și sunt mapate;
​

parolele sunt salvate hash-uit cu BCrypt;
​

flow-ul JWT este în curs de finalizare și testare completă.

Structura curentă backend
Structura curentă folosită:

src/main/java/com/licenta/microjobsPlatform/controller

src/main/java/com/licenta/microjobsPlatform/service

src/main/java/com/licenta/microjobsPlatform/repository

src/main/java/com/licenta/microjobsPlatform/model

src/main/java/com/licenta/microjobsPlatform/dto

src/main/java/com/licenta/microjobsPlatform/security

src/main/resources

pom.xml

Clase / fișiere create până acum:

model/User.java
​

model/Role.java
​

repository/UserRepository.java
​

service/UserService.java
​

service/CustomUserDetailsService.java
​

controller/UserController.java
​

dto/LoginRequest.java
​

dto/LoginResponse.java
​

security/SecurityConfig.java
​

security/JwtService.java
​

security/JwtAuthenticationFilter.java
​

Funcționalități implementate până acum
register utilizator;

login utilizator;

roluri: USER și ADMIN;
​

validare pentru email unic;
​

validare pentru număr de telefon unic;
​

criptarea parolei cu BCrypt;

răspuns corect de tip 409 Conflict pentru cont duplicat;
​

structură JWT adăugată în backend;

generare token JWT la login, la nivel de cod;
​

încărcare user pentru autentificare prin CustomUserDetailsService;
​

Probleme identificate și clarificate
a existat o problemă de conectare la MongoDB Atlas din cauza schimbării IP-ului public și a whitelist-ului;

au existat useri vechi salvați neuniform în baza de date, inclusiv cu parole în clar, ceea ce a afectat testele de autentificare;

baza a fost curățată pentru retestare corectă de la zero;

SecurityConfig este acum într-o variantă temporară de test și trebuie readus în forma finală JWT după validarea completă a fluxului;
​

UserRepository și unele metode mai pot fi curățate și tipizate mai bine.

Funcționalități planificate
MVP pentru licență:

profil utilizator;

creare job;

editare / ștergere job;

listare joburi;

pagină detalii job;

aplicare la job;

acceptare / respingere aplicant;

status job: OPEN / IN_PROGRESS / COMPLETED;

review simplu după finalizare;

finalizarea autentificării cu JWT;

protejarea endpoint-urilor care necesită utilizator logat.

Flux general aplicație
Utilizatorul intră în aplicație.
Își creează cont sau se loghează.
Utilizatorul poate posta un microjob.
Alt utilizator vede lista de joburi și aplică.
Utilizatorul care a postat jobul acceptă sau respinge aplicantul.
Jobul este marcat ulterior ca finalizat.
Se poate adăuga review.
Acest flux respectă logica de bază din schema inițială, în care utilizatorul logat poate fie să listeze propriul conținut, fie să se înscrie la conținutul altuia.
​

Ce urmează
Următorii pași planificați:

finalizarea testării complete pentru flow-ul JWT, register -> login -> token -> endpoint privat;

readucerea SecurityConfig în varianta finală stateless, cu:

register, login și eventual /error pe permitAll(),

restul endpoint-urilor pe authenticated(),

authenticationProvider(...),

sessionCreationPolicy(STATELESS),

addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

adăugarea unui endpoint privat simplu de test, de tip /me, pentru verificarea JWT;

curățarea codului din UserRepository și UserService prin tipizare corectă cu generics;

securizarea completă a configurării MongoDB prin mutarea secretelor și URI-ului în variabile de mediu, unde mai este nevoie;

implementarea entității Job;

crearea structurii pentru joburi: model, repository, service, controller;

implementarea funcționalităților de creare, listare și detalii job;

implementarea aplicării la job;

implementarea acceptării / respingerii aplicanților;

după stabilizarea backend-ului, începerea frontend-ului în React.

Context pentru thread următor
Dacă acest proiect este continuat într-un alt thread, contextul de pornire este:

proiect licență: platformă web de microjoburi;

backend deja creat în Spring Boot 3.5.12;

MongoDB Atlas deja conectat și funcțional;

problema de whitelist IP pentru Atlas a fost identificată și rezolvată;

Git și GitHub deja configurate;

repository privat deja creat;

structura backend este deja făcută;

entitatea User este deja creată;
​

enum-ul Role este deja creat, cu valorile USER și ADMIN;
​

UserRepository, UserService, UserController și CustomUserDetailsService sunt deja create;

endpoint-ul de register funcționează;

endpoint-ul de login există și a fost adaptat să genereze token JWT;

parolele sunt salvate hash-uit cu BCrypt;

există DTO-urile LoginRequest și LoginResponse;

există JwtService și JwtAuthenticationFilter;

configurarea actuală de securitate este încă în variantă temporară de test și trebuie readusă în forma finală;
​

baza users a fost curățată pentru retestare corectă;

următorul pas dorit este validarea completă a autentificării cu JWT și apoi continuarea cu backend-ul pentru joburi.

Te rog să continui din acest punct, fără să reiei configurarea inițială.
Update făcut în 23 martie 2026.

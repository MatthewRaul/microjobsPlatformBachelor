# Microjobs Platform - Licenta

## Descriere proiect
Aceasta aplicatie reprezinta tema lucrarii mele de licenta si consta intr-o platforma web de microjoburi.

Ideea principala:
- utilizatorii isi pot crea cont
- un utilizator poate posta microjoburi
- un utilizator poate vedea joburile si poate aplica la ele
- utilizatorul care a postat jobul poate accepta sau respinge aplicanti
- ulterior se poate adauga sistem de review/rating

Aplicatia este inspirata ca flux general dintr-o schema initiala bazata pe pagini de tip home, login/register, listare, detalii si adaugare continut, adaptata pentru microjoburi [file:28].

## Tehnologii folosite
- Backend: Spring Boot 3.5.12
- Frontend: React (urmeaza sa fie creat)
- Baza de date: MongoDB Atlas
- Securitate: Spring Security
- Build tool: Maven
- Version control: Git + GitHub (repository privat)
- Editor: Visual Studio Code

## Stadiu curent al proiectului
Pana acum am realizat:
- crearea proiectului backend cu Spring Initializr
- configurarea Spring Boot pe versiunea 3.5.12
- conectarea cu MongoDB Atlas
- pornirea cu succes a backend-ului
- initializarea repository-ului Git
- crearea unui repository privat pe GitHub
- primul push al proiectului
- crearea structurii de baza a backend-ului pe pachete
- crearea entitatii `User`
- definirea enum-ului `Role`
- alegerea modelului de roluri `USER` si `ADMIN`
- crearea `UserRepository`
- crearea `UserService`
- crearea `UserController`
- implementarea endpoint-ului de register
- implementarea validarii pentru email si numar de telefon deja existente
- testarea register-ului in Postman
- configurarea unui `PasswordEncoder` cu BCrypt
- hash-uirea parolei la inregistrare
- implementarea unui login simplu pe baza de email + parola
- crearea DTO-urilor `LoginRequest` si `LoginResponse`
- modificarea login-ului astfel incat sa nu mai returneze parola
- configurarea temporara Spring Security pentru testare fara JWT
- tratarea duplicate-urilor la register cu raspuns `409 Conflict`

## Configurare backend
Fisier principal configurare:
- `src/main/resources/application.properties`

Configurare actuala:
- aplicatia ruleaza pe portul 8080
- backend-ul este conectat la MongoDB Atlas
- exista configurare Spring Security personalizata, temporara, pentru dezvoltare si testare
- endpoint-urile de `register` si `login` sunt functionale
- parolele sunt salvate hash-uit cu BCrypt
- autentificarea cu JWT urmeaza sa fie implementata

## Structura curenta backend
Structura curenta folosita:
- `src/main/java/com/licenta/microjobsPlatform/controller`
- `src/main/java/com/licenta/microjobsPlatform/service`
- `src/main/java/com/licenta/microjobsPlatform/repository`
- `src/main/java/com/licenta/microjobsPlatform/model`
- `src/main/java/com/licenta/microjobsPlatform/dto`
- `src/main/java/com/licenta/microjobsPlatform/config`
- `src/main/java/com/licenta/microjobsPlatform/security`
- `src/main/resources`
- `pom.xml`

Clase / fisiere create pana acum:
- `model/User.java`
- `model/Role.java`
- `repository/UserRepository.java`
- `service/UserService.java`
- `controller/UserController.java`
- `dto/LoginRequest.java`
- `dto/LoginResponse.java`
- `security/SecurityConfig.java`

## Functionalitati implementate pana acum
- register utilizator
- login utilizator
- roluri: `USER` si `ADMIN`
- validare pentru email unic
- validare pentru numar de telefon unic
- criptarea parolei cu BCrypt
- raspuns corect de tip `409 Conflict` pentru cont duplicat

## Functionalitati planificate
MVP pentru licenta:
- profil utilizator
- creare job
- editare / stergere job
- listare joburi
- pagina detalii job
- aplicare la job
- acceptare / respingere aplicant
- status job: `OPEN` / `IN_PROGRESS` / `COMPLETED`
- review simplu dupa finalizare
- autentificare cu JWT
- protejarea endpoint-urilor care necesita utilizator logat

## Flux general aplicatie
1. Utilizatorul intra in aplicatie.
2. Isi creeaza cont sau se logheaza.
3. Utilizatorul poate posta un microjob.
4. Alt utilizator vede lista de joburi si aplica.
5. Utilizatorul care a postat jobul accepta sau respinge aplicantul.
6. Jobul este marcat ulterior ca finalizat.
7. Se poate adauga review.

Acest flux respecta logica de baza din schema initiala, in care utilizatorul logat poate fie sa listeze propriul continut, fie sa se inscrie la continutul altuia [file:28].

## Ce urmeaza
Urmatorii pasi planificati:
1. securizarea configurarii MongoDB (mutarea URI-ului in variabila de mediu, daca nu este deja facut complet)
2. adaugarea dependintelor JWT in `pom.xml`
3. crearea clasei utilitare pentru generarea si validarea tokenului JWT
4. modificarea login-ului pentru a returna token JWT
5. crearea filtrului JWT
6. protejarea endpoint-urilor private
7. implementarea entitatii `Job`
8. crearea structurii pentru joburi: model, repository, service, controller
9. implementarea functionalitatilor de creare, listare si detalii job
10. implementarea aplicarii la job
11. implementarea acceptarii / respingerii aplicantilor

## Context pentru thread urmator
Daca acest proiect este continuat intr-un alt thread, contextul de pornire este:

- proiect licenta: platforma web de microjoburi
- backend deja creat in Spring Boot 3.5.12
- MongoDB Atlas deja conectat si functional
- Git si GitHub deja configurate
- repository privat deja creat
- structura backend este deja facuta
- entitatea `User` este deja creata
- enum-ul `Role` este deja creat, cu valorile `USER` si `ADMIN`
- `UserRepository`, `UserService` si `UserController` sunt deja create
- endpoint-ul de `register` functioneaza
- endpoint-ul de `login` functioneaza
- parolele sunt salvate hash-uit cu BCrypt
- exista DTO-urile `LoginRequest` si `LoginResponse`
- configurarea actuala de securitate este temporara, pentru dezvoltare
- urmatorul pas dorit este implementarea autentificarii cu JWT
- dupa JWT vrem sa continuam cu backend-ul pentru joburi

Te rog sa continui din acest punct, fara sa reiei configurarea initiala. --Update facut in 22 martie 2026.

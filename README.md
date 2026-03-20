# Microjobs Platform - Licenta

## Descriere proiect
Aceasta aplicatie reprezinta tema lucrarii mele de licenta si consta intr-o platforma web de microjoburi.

Ideea principala:
- utilizatorii isi pot crea cont
- un client poate posta microjoburi
- un worker poate vedea joburile si poate aplica la ele
- clientul poate accepta sau respinge aplicanti
- ulterior se poate adauga sistem de review/rating

Aplicatia este inspirata ca flux general dintr-o schema initiala bazata pe pagini de tip home, login/register, listare, detalii si adaugare continut, adaptata pentru microjoburi [file:1].

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

## Configurare backend
Fisier principal configurare:
- `src/main/resources/application.properties`

Configurare actuala:
- aplicatia ruleaza pe portul 8080
- backend-ul este conectat la MongoDB Atlas
- pentru moment exista configurarea implicita oferita de Spring Security
- autentificarea proprie cu JWT urmeaza sa fie implementata

## Structura curenta backend
Structura actuala generata de Spring:
- `src/main/java/com/licenta/microjobsPlatform`
- `src/main/resources`
- `pom.xml`

Structura planificata:
- `controller`
- `service`
- `repository`
- `model`
- `dto`
- `config`
- `security`

## Functionalitati planificate
MVP pentru licenta:
- register / login
- roluri: CLIENT si WORKER
- profil utilizator
- creare job
- editare / stergere job
- listare joburi
- pagina detalii job
- aplicare la job
- acceptare / respingere aplicant
- status job: OPEN / IN_PROGRESS / COMPLETED
- review simplu dupa finalizare

## Flux general aplicatie
1. Utilizatorul intra in aplicatie.
2. Isi creeaza cont sau se logheaza.
3. Clientul posteaza un microjob.
4. Workerul vede lista de joburi si aplica.
5. Clientul accepta sau respinge aplicantul.
6. Jobul este marcat ulterior ca finalizat.
7. Se poate adauga review.

## Ce urmeaza
Urmatorii pasi planificati:
1. securizarea configurarii MongoDB (mutarea URI-ului in variabila de mediu)
2. crearea structurii backend
3. crearea entitatii `User`
4. definirea rolurilor
5. crearea repository-ului pentru user
6. implementarea autentificarii

## Context pentru thread urmator
Daca acest proiect este continuat intr-un alt thread, contextul de pornire este:

- proiect licenta: platforma web de microjoburi
- backend deja creat in Spring Boot 3.5.12
- MongoDB Atlas deja conectat si functional
- Git si GitHub deja configurate
- repository privat deja creat
- vrem sa continuam cu backend-ul, in special structura proiectului, entitatea `User` si autentificarea

Te rog sa continui din acest punct, fara sa reiei configurarea initiala. --Update facut in 21 martie 2026.

package com.licenta.microjobsPlatform.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {
    @Value("${security.jwt.secret-key}") //ia valorile din application.properties si le baga in variabile java
    private String secretKey;

    @Value("${security.jwt.expiration-time}")
    private long jwtExpiration;

    public String extractUsername(String token){ //extrage emailul
        return extractClaim(token, Claims::getSubject);
    
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver){ //exxtrage informatiile din token, de mai multe tipuri cum e String sau Date
        Claims claims=extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {//genereaza un token cu inf de baza, fara detalii extra
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .claims(extraClaims)//se baga inf extra
                .subject(userDetails.getUsername())//se selecteaza userul
                .issuedAt(new Date(System.currentTimeMillis()))//cand a fost creat
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))//se alege data valabilitatii
                .signWith(getSignInKey())//semnare token cu cheie secreta
                .compact();//se transforma tot ce am pus mai sus intr un sir final JWT
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {//verifica daca tokenul este bun pentru persoana care trebuie
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {//verificare daaca tokenul e expirat
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private Claims extractAllClaims(String token) {//citeste tokenul si scoate tot continutul din el, il verifica folosind aceeasi cheie cu care a fost semnat
        return Jwts.parser()//porneste parserul
                .verifyWith(getSignInKey())//se specifica cu ce cheie verifici semnatura
                .build()//construieste parserul
                .parseSignedClaims(token)//parseaza tokenul semnat
                .getPayload();//scoate partea cu datele din token
    }

    private SecretKey getSignInKey() {//se transforma cheia din app.properties intr o cheie reala, pe care sa o poata folosi biblioteca 
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
}

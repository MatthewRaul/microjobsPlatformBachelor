package com.licenta.microjobsPlatform.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

// Activeaza suportul pentru @Async in EmailService
// Fara aceasta adnotare, emailurile ar fi trimise sincron si ar bloca requestul HTTP
@Configuration
@EnableAsync
public class AsyncConfig {
}
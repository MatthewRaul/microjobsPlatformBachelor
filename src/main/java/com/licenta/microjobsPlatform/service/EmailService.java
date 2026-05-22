package com.licenta.microjobsPlatform.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // Trimiterea e asincrona - nu blocheaza requestul HTTP
    @Async
    public void sendEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Eroare la trimiterea emailului catre " + to + ": " + e.getMessage());
        }
    }

    // === Template-uri email ===
    public void sendWelcomeEmail(String to, String firstName) {
        String subject = "Bun venit pe platforma JobY!";
        String body = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Bun venit, %s! 👋</h2>
                    <p>Contul tău a fost înregistrat cu succes .</p>
                    <p>Acum poți:</p>
                    <ul>
                        <li>Să aplici la joburi disponibile</li>
                        <li>Să publici propriile joburi</li>
                        <li>Să îți completezi profilul pentru a-ți crește șansele</li>
                    </ul>
                    <p style="margin-top: 24px; color: #888; font-size: 13px;">
                        Echipa jobY
                    </p>
                </div>
                """.formatted(firstName);
        sendEmail(to, subject, body);
    }

    public void sendApplicationAcceptedEmail(String to, String firstName, String jobTitle) {
        String subject = "Aplicarea ta a fost acceptată! ✅";
        String body = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #16a34a;">Felicitări, %s! 🎉</h2>
                    <p>Aplicarea ta la jobul <strong>"%s"</strong> a fost <strong>acceptată</strong>.</p>
                    <p>Intră pe platformă pentru a vedea detaliile jobului și pentru a lua legătura cu angajatorul.</p>
                    <p style="margin-top: 24px; color: #888; font-size: 13px;">
                        Echipa JobY
                    </p>
                </div>
                """.formatted(firstName, jobTitle);
        sendEmail(to, subject, body);
    }

    public void sendApplicationRejectedEmail(String to, String firstName, String jobTitle) {
        String subject = "Actualizare aplicare job";
        String body = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Salut, %s</h2>
                    <p>Din păcate, aplicarea ta la jobul <strong>"%s"</strong> a fost <strong>respinsă</strong>.</p>
                    <p>Nu te descuraja — mai sunt multe joburi disponibile pe platformă!</p>
                    <p style="margin-top: 24px; color: #888; font-size: 13px;">
                        Echipa JobY
                    </p>
                </div>
                """.formatted(firstName, jobTitle);
        sendEmail(to, subject, body);
    }

    public void sendJobCancelledEmail(String to, String firstName, String jobTitle) {
        String subject = "Job anulat: " + jobTitle;
        String body = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Notificare anulare job</h2>
                    <p>Salut, <strong>%s</strong>!</p>
                    <p>Din păcate, jobul <strong>"%s"</strong> la care ai fost acceptat a fost <strong>anulat</strong> de angajator.</p>
                    <p>Îți recomandăm să explorezi alte oportunități disponibile pe platformă.</p>
                    <p style="margin-top: 24px; color: #888; font-size: 13px;">
                        Echipa JobY
                    </p>
                </div>
                """.formatted(firstName, jobTitle);
        sendEmail(to, subject, body);
    }

    public void sendNewApplicationNotificationEmail(String to, String ownerFirstName,
            String applicantFirstName, String applicantLastName,
            String jobTitle) {
        String subject = "Cineva a aplicat la jobul tău!";
        String body = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Notificare nouă aplicare</h2>
                    <p>Salut, <strong>%s</strong>!</p>
                    <p><strong>%s %s</strong> a aplicat la jobul tău <strong>"%s"</strong>.</p>
                    <p>Intră pe platformă pentru a vedea profilul aplicantului și a lua o decizie.</p>
                    <p style="margin-top: 24px; color: #888; font-size: 13px;">
                        Echipa JobY
                    </p>
                </div>
                """.formatted(ownerFirstName, applicantFirstName, applicantLastName, jobTitle);
        sendEmail(to, subject, body);
    }

    public void sendApplicationWithdrawnEmail(String to, String ownerFirstName, String applicantFirstName, String applicantLastName, String jobTitle) {
        String subject = "Un aplicant și-a retras aplicarea";
        String body = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #f59e0b;">Notificare retragere aplicare</h2>
                <p>Salut, <strong>%s</strong>!</p>
                <p><strong>%s %s</strong> și-a retras aplicarea de la jobul tău <strong>"%s"</strong>.</p>
                <p>Dacă mai ai nevoie de un candidat, intră pe platformă pentru a vedea ceilalți aplicanți.</p>
                <p style="margin-top: 24px; color: #888; font-size: 13px;">
                    Echipa JobY
                </p>
            </div>
                """.formatted(ownerFirstName, applicantFirstName, applicantLastName, jobTitle);
        sendEmail(to, subject, body);
    }
}

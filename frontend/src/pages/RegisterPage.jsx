// RegisterPage este formularul de creare cont.
// Și aici facem întâi interfața, apoi legăm backend-ul.

function RegisterPage() {
  return (
    <section className="page auth-page">
      <h1>Register</h1>

      <form className="auth-form">
        <label htmlFor="name">Nume</label>
        <input
          id="name"
          type="text"
          placeholder="Introdu numele"
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Introdu emailul"
        />

        <label htmlFor="password">Parolă</label>
        <input
          id="password"
          type="password"
          placeholder="Creează o parolă"
        />

        <button type="submit" className="primary-button">
          Creează cont
        </button>
      </form>
    </section>
  );
}

export default RegisterPage;
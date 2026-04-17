// RegisterPage este formularul de creare cont.
// Și aici facem întâi interfața, apoi legăm backend-ul.
import { useState} from "react";
import {registerUser} from "../api/register";
import {useNavigate} from "react-router-dom";



function RegisterPage() {
  const navigate=useNavigate();

  const [firstName,setFirstName]=useState("");
  const [lastName,setLastName]=useState("")
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [phoneNumber,setPhoneNumber]=useState("");
  const [confirmPassword,setConfirmPassword]=useState("");

  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  const handleSubmit=async (e)=>{
    e.preventDefault();


    setError("");
  

    if(!firstName.trim()||
      !lastName.trim()||
      !email.trim()||
      !phoneNumber.trim()||
      !password.trim()||
      !confirmPassword.trim()){
      setError("Toate campurile sunt obligatorii.");
      return;
    }
  
    if(password!=confirmPassword){
      setError("Parolele nu coincid.");
      return;
    }

    if(password.length<6){
      setError("Parola trebuia sa aiba minim 6 caractere.");
      return;
    }

    //se construieste obiectul cu datele din formular care va fi transmis catre backend
      const registerData={
        firstName,
        lastName,
        email,
        phoneNumber,
        password
      };
      try{
        //Pornim starea de loading.
        setLoading(true);
        //trimite datele catre backend
        await registerUser(registerData);
        navigate("/login",{
          state:{
            successMessage:"Contul a fost creat cu succes.",
          },
        });


      }catch(err){
        //se incearca preluarea mesajului de eroare, fara sa puste aplicatia
        const backendMessage=
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Inregistrarea a esuat.Verifica datele introduse.";
        setError(backendMessage);

      }finally{
        setLoading(false);
      }
  };

  return (
    <section className="page auth-page">
      <h1>Register</h1>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="firstName">Prenume</label>
        <input
          id="firstName"
          type="text"
          placeholder="Introdu prenumele"
          value={firstName}
          onChange={(e)=>setFirstName(e.target.value)}
        />

        <label htmlFor="lastname">Nume</label>
        <input
          id="lastName"
          type="text"
          placeholder="Introdu numele"
          value={lastName}
          onChange={(e)=>setLastName(e.target.value)}
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Introdu emailul"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <label htmlFor="phoneNumber">Numar de telefon</label>
        <input
          id="phoneNumber"
          type="text"
          placeholder="Introdu numarul de telefon"
          value={phoneNumber}
          onChange={(e)=>setPhoneNumber(e.target.value)}
        />

        <label htmlFor="password">Parolă</label>
        <input
          id="password"
          type="password"
          placeholder="Creează o parolă"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

         <label htmlFor="confirmPassword">Confirmă parola</label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Reintrodu parola"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

      
        {error && <p className="form-error">{error}</p>}
        

        <button type="submit" className="primary-button" disabled={loading}>
          {loading? "Se proceseaza..." : "Creează cont"}
        </button>
      </form>
    </section>
  );
}

export default RegisterPage;
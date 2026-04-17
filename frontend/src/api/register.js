import axios from "axios";
//axios este biblioteca ce trimite cereri HTTP din React catre backend

const API_BASE_URL="http://localhost:8080/api/users";

export const registerUser = async (userData)=>{
    const response=await axios.post(`${API_BASE_URL}/register`,userData);

    return response.data;
}

//primeste un obiect cu datele user ului si le trimite la http://localhost:8080/api/users/register
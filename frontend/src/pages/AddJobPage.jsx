import {useState, useEffect} from "react";
import {createJob, updateJob, getJobById} from "../api/jobApi";
import { useNavigate,useParams } from "react-router-dom";


function AddJobPage() {
    const navigate=useNavigate();
    const [title,setTitle]=useState("");
    const [description,setDescription]=useState("");
    const [neededWorkers,setNeededWorkers]=useState(1);
    const [startDate,setStartDate]=useState("");
    const [endDate,setEndDate]=useState("");
    const [salary,setSalary]=useState("");
    const [location,setLocation]=useState("");
    const [error,setError]=useState("");
    const [loading,setLoading]=useState(false);
    const [successMessage,setSuccessMessage]=useState("");

    const handleSubmit= async (e) => {
        e.preventDefault();
        setError("");

        if(
            !title.trim()||
            !description.trim()||
            !startDate.trim()||
            !endDate.trim()||
            !location.trim()
        ){
            setError("Completeaza toate campurile obligatorii");
            return;
        }

        if(Number(neededWorkers)<1){
            setError("Numarul de participanti trebuie sa fie minim 1");
            return;
        }

        if(salary===""){
            setError("Salariul este obligatoriu.");
            return
        }
        if(Number(salary)<0){
            setError("Salariul nu poate fi negativ");
            return;
        }
        if(new Date(endDate)<new Date(startDate)){
            setError("Data de sfarsit trebuie sa fie dupa data de inceput");
            return
        }

        const jobData= {
            title,
            description,
            neededWorkers: Number(neededWorkers),
            startDate,
            endDate,
            salary: Number(salary),
            location
        };

        try{
            setLoading(true);
            await createJob(jobData);
            setSuccessMessage("Job publicat cu succes");

            setTitle("");
            setDescription("");
            setNeededWorkers(1);
            setStartDate("");
            setEndDate("");
            setSalary("");
            setLocation("");
            navigate("/");
        }catch(err){
            console.error(err);
            console.error(err.response?.data);
            console.error(err.response?.status);
            setError("Nu s-a putut publica jobul");
        }finally{
            setLoading(false);
        }
    };

    return (
        <section className="page auth-page">
            <h1>Adauga un job</h1>

            <form className="auth-form" onSubmit={handleSubmit}>
                <label htmlFor="title"> Denumire post </label>
                <input 
                    id="title"
                    type="text"
                    placeholder="Introdu denumirea jobului"
                    value={title}
                    onChange={(e)=>setTitle(e.target.value)}
                />
                <label htmlFor="description"> Descriere job </label>
                <input 
                    id="description"
                    type="text"
                    placeholder="Introdu o scurta descriere"
                    value={description}
                    onChange={(e)=>setDescription(e.target.value)}
                />

                <label htmlFor="neededWorkers"> Numar participanti </label>
                <input 
                    id="neededWorkers"
                    type="number"
                    min="1"
                    value={neededWorkers}
                    onChange={(e)=>setNeededWorkers(e.target.value)}
                />

                <label htmlFor="startDate"> Data si ora start </label>
                <input 
                    id="startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e)=>setStartDate(e.target.value)}
                />

                <label htmlFor="endDate"> Data si ora finalizare </label>
                <input 
                    id="endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e)=>setEndDate(e.target.value)}
                />

                <label htmlFor="salary">Salariu</label>
                <input
                    id="salary"
                    type="number"
                    min="0"
                    placeholder="Introdu salariul"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                />
                <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e)=>setLocation(e.target.value)}
                />

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="primary-button">
                Publica job
            </button>    
        </form>
    </section>
    );
} 

export default AddJobPage;
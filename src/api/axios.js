    import axios from "axios";


const API_BASE = import.meta.env.VITE_API_URL;
console.log("env", API_BASE)


    const instance = axios.create({
        baseURL: API_BASE,
        withCredentials:true,
        headers:{
            "Content-Type":"application/json"
        }
    })

    export default instance;
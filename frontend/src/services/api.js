import axios from "axios";

const API = axios.create({
  baseURL: "https://recommendation-engine-3qfu.onrender.com",
});

export default API;

import axios from "axios";

export const api = axios.create({
  baseURL: "https://liderai-backend-arthur-dmbmckczgbftg9hk.eastus-01.azurewebsites.net",
});
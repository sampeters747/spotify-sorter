import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_API_URL,
  timeout: 3000,
  withCredentials: true
});

async function getMe() {
    try {
        const response = await axiosInstance.get("/me");
        return response.data;
    } catch (error) {
        throw new Error("Request to get user information was unsuccessful");
    }
}

async function getAPIToken(code) {
    try {
        // Send a POST request
        const response = await axiosInstance({
            method: 'post',
            url: '/login',
            data: {
                authCode: code,
            }
        });
        console.log(response.data);
        return response.data
    } catch (error) {
        throw new Error("Request to get API token was unsuccesful");
    }
}

export { axiosInstance, getMe, getAPIToken }
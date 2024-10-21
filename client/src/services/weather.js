import axios from "axios";

const key = import.meta.env.VITE_API_KEY_AccuWeather;

export const apiGetWeather = async () => {
    const response = await axios.get(`http://dataservice.accuweather.com/currentconditions/v1/423444?apikey=${key}`);
    return response;
};
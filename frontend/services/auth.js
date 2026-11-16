
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function loginAdmin(email, password) {
  try {
    const response = await axios.post(
      `${API_URL}/admin-login`,
      {
        email: email.trim().toLowerCase(),
        password,
      }
    );

    const data = response.data;

    if (!data.success || !data.token || !data.user) {
      throw new Error(data.message || "Login failed");
    }

    // Save login information in the browser
    localStorage.setItem("token", data.token);
    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    return data;
  } catch (error) {
    throw error;
  }
}

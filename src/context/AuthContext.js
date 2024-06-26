import React, { createContext, useState } from "react";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";
import { validateEmail, validatePassword } from "../components/Validations";
import Config from "@/config";

const apiURL = Config.API_BASE_URL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const navigation = useNavigation();
  const [error, setError] = useState({
    email: "",
    password: "",
  });

  const login = async (username, password) => {
    setIsLoading(true);

    const passwordValidation = validatePassword(password);
    const emailValidation = validateEmail(username);

    if (!emailValidation.isValid || !passwordValidation.isValid) {
      setError({
        email: emailValidation.Message,
        password: passwordValidation.Message,
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${apiURL}/api/v1/auth/authentication`,
        {
          email: username,
          password: password,
        }
      );
      console.log(response);
      const { token } = response.data.token;
      setUserToken(token);
      setIsLoading(false);
      navigation.navigate("HomeScreen");
    } catch (error) {
      let errorMessage = "Something went wrong! Please try again later";
      if (error.response && error.response.data) {
        errorMessage =
          error.response.data.Message || "Invalid Email or Password";
      }
      setError({
        email: errorMessage,
        password: errorMessage,
      });
      console.error("Login Failed", errorMessage);
      Alert.alert(errorMessage);
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUserToken(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ login, logout, isLoading, userToken }}>
      {children}
    </AuthContext.Provider>
  );
};

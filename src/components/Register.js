import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";
import { useHistory, Link } from "react-router-dom";


const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loader, setLoader] = useState(false)

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const history = useHistory()

  // TODO: CRIO_TASK_MODULE_REGISTER - Implement the register function


  /**
   * Definition for register handler
   * - Function to be called when the user clicks on the register button or submits the register form
   *
   * @param {{ username: string, password: string, confirmPassword: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/register"
   *
   * Example for successful response from backend for the API call:
   * HTTP 201
   * {
   *      "success": true,
   * }
   *
   * Example for failed response from backend for the API call:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Username is already taken"
   * }
   */
  const register = async (formData) => {
      const { username, password } = formData

      const data = {
        username: username,
        password: password
      }

      try {

        if(validateInput(formData)) {
          //success
          setLoader(true)
          axios
          .post(config.endpoint + "/auth/register", data)
          .then((res) => {
            if(res.status === 201) {
              enqueueSnackbar("Success!", { variant: "success" });
              // console.log(res);  
              setFormData({
                username: "",
                password: "",
                confirmPassword: "",
              })
              setLoader(false)
              history.push("/login", { from: "Register" })
            }
          })
          .catch((err) => {
            // console.log(err.response.status)
            enqueueSnackbar(err.response.data.message, { variant: "error" });
            setLoader(false)
          });
        }
      } catch(e) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        setLoader(false)
      }
  };

  // TODO: CRIO_TASK_MODULE_REGISTER - Implement user input validation logic
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string, confirmPassword: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that username field is not less than 6 characters in length - "Username must be at least 6 characters"
   * -    Check that password field is not an empty value - "Password is a required field"
   * -    Check that password field is not less than 6 characters in length - "Password must be at least 6 characters"
   * -    Check that confirmPassword field has the same value as password field - Passwords do not match
   */
  const validateInput = (data) => {
    const { username, password, confirmPassword} = data

    if(username === "") {
      enqueueSnackbar("Username is a required field", { variant: "error" })
      return false
    } else if(username.length < 6) {
      enqueueSnackbar("Username must be atleast 6 characters", { variant: "warning" })      
      return false
    } else if(password === "") {
      enqueueSnackbar("Password is a required field", { variant: "error" })      
      return false
    } else if(password.length < 6) {
      enqueueSnackbar("Password must be atleast 6 characters", { variant: "warning" })            
      return false
    } else if(confirmPassword === "") {
      enqueueSnackbar("Confirm Password is a required field", { variant: "error" })      
      return false
    } else if(confirmPassword !== password) {
      enqueueSnackbar("Passwords do not match", { variant: "warning" })                  
      return false
    } else return true
  };


  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            onChange={(e) => setFormData({...formData, username: e.target.value })}
            value={formData.username}
            placeholder="Enter Username"
            fullWidth
          />
          <TextField
            onChange={(e) => setFormData({...formData, password: e.target.value })}
            value={formData.password}
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
          />
          <TextField
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value })}
            value={formData.confirmPassword}
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
          />
          {
            loader ? <div className="loader"><CircularProgress /></div> : 
            <Button className="button" variant="contained" onClick={() => register(formData)}>
              Register Now
            </Button>
          }

          <p className="secondary-action">
            Already have an account?{" "}
            {/* <a className="link" href="#">
              Login here
            </a> */}
            <Link className="link" to="/register">Login here</Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;

require('dotenv').config();
const axios = require("axios");
const express = require("express");
const app = express();
const port = 3000;

// set env variables
const ctAccountId = process.env.CLEVERTAP_ACCOUNT_ID;
const ctPasscode = process.env.CLEVERTAP_PASSCODE;
const region = process.env.CLEVERTAP_REGION;

// First generate the o-auth 2.0 token for zoho and then you'll get the access token used to make api calls 
const zohoUsers = 'https://www.zohoapis.in/crm/v6/users?type=AllUsers';
const ctUserPushURI = 'https://in1.api.clevertap.com/1/upload'
const authTokenForZohoUsers = process.env.AUTH_TOKEN_ZOHO_USERS_MODULES_SCOPE;

const fetchZohoUsers = async () => {

  try {
        const response = await axios.get(zohoUsers, {
            headers: {
                'Authorization': `Zoho-oauthtoken ${authTokenForZohoUsers}`
            }
        });

        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;  // Rethrow the error to handle it further up the call stack if needed
    }
}

const pushToCleverTap = async (profile) => {

  const headers = {
        'X-CleverTap-Account-Id': ctAccountId,
        'X-CleverTap-Passcode': ctPasscode,
        'Content-Type': 'application/json; charset=utf-8'
    };

    const data = {
        d: [profile]
    };

    try { 
        const response = await axios.post(ctUserPushURI, data, { headers });
        // console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Error creating/updating user profile:', error.response ? error.response.data : error.message);
        throw error;
    }
}

app.get("/", (req, res) => {

  const callAPIs = async () => {
    const data = await fetchZohoUsers();
    const {country, state, zuid, email, full_name, id} = data.users[0]

    const profile = {
      objectId: id, // Unique identifier for the user
      type: "profile",
      profileData: {
          Name: full_name,
          Email: email,
          "country": country,
          "state": state,
          "zuid": zuid
      }
    };  

    const response = await pushToCleverTap(profile);
    console.log('User profile created/updated successfully:', response);

  }

  callAPIs();
  res.send('Pipeline running...');
});
    

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});




const axios = require('axios');
const forge = require('node-forge');
const fernet = require('fernet');

const jwtAccess = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjUxNjc0NDE0LCJq" +
  "dGkiOiI4Mjc1ZTIxM2VlMTk0NmJhODg3OGUyNDg0ZDY1Y2E4NyIsInVzZXJJRCI6MjM1LCJpc3MiOiJTZXJ1bXNBdXRoZW50aWNhdGlvbiIsI" +
  "mlhdCI6MTY0OTA4MjQxNCwic3ViIjoicGF0aWVudDc3N0B1c3Rhbi5jb20iLCJncm91cElEcyI6WyJQQVRJRU5UIl0sIm9yZ0lEIjoiVVNUQU" +
  "4iLCJkZXB0SUQiOm51bGwsImRlcHROYW1lIjpudWxsLCJzdGFmZklEIjpudWxsLCJuYW1lIjpudWxsLCJhdWQiOiJodHRwczovL3NoY3Muc2V" +
  "ydW1zLmNzLnN0LWFuZHJld3MuYWMudWsvIn0.3uSd55wPpU41brPodga-1KNboLNFbiuxJ-aidTmeIAU"
const staffJwtAccess = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjUyMDAyODY" +
  "5LCJqdGkiOiIyODY4ZmUxY2YwYzg0ZDMwODE5MWRlMzZhMDc5MTQ0OCIsInVzZXJJRCI6MjExLCJpc3MiOiJTZXJ1bXNBdXRoZW50aWNhdGlv" +
  "biIsImlhdCI6MTY0OTQxMDg2OSwic3ViIjoic3RhZmZfZW1lcmdlbmN5QHVzdGFuLmNvbSIsImdyb3VwSURzIjpbIk1FRElDQUxfU1RBRkYiL" +
  "CJFTUVSR0VOQ1kiXSwib3JnSUQiOiJVU1RBTiIsImRlcHRJRCI6bnVsbCwiZGVwdE5hbWUiOm51bGwsInN0YWZmSUQiOm51bGwsIm5hbWUiOm" +
  "51bGwsImF1ZCI6Imh0dHBzOi8vc2hjcy5zZXJ1bXMuY3Muc3QtYW5kcmV3cy5hYy51ay8ifQ.wqSBl4Z3laXUqb6ASD5G6UrTLlNzV4gVFohL" +
  "jgsaWqM"

const getHeader = (jwtAccess) => {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + jwtAccess,
  }
}

const _createRule = (jwtAccess, reqBody) => {
  const url = "http://localhost:7002/blockchain/api/create_rule";
  const promise = axios.post(url, reqBody, {
    headers: getHeader(jwtAccess),
  })
  const response = promise.then(response => response.data);
  return response;
}

const _getDepartment = (jwtStaff) => {
  const url = "http://localhost:5000/staff_tables/get_department_of_staff_member";
  const promise = axios.get(url, {
    headers: getHeader(jwtStaff),
  })
  const response = promise.then(response => response.data);
  return response;
}

const _getAllowTags = (jwtAccess, reqBody) => {
  const url = "http://localhost:7002/blockchain/api/get_allow_tags_with_department";
  const promise = axios.post(url, reqBody, {
    headers: getHeader(jwtAccess),
  })
  const response = promise.then(response => response.data);
  return response;
}

const requestEncryptedSPHR = (jwtAccess) => {
  const rsa = forge.pki.rsa;
  rsa.generateKeyPair({bits: 2048, workers: 2}, function (err, keypair) {
    forge.pki.publicKeyToRSAPublicKeyPem(keypair.privateKey);
    forge.pki.privateKeyToPem(keypair.privateKey);
    const privateKey = keypair.privateKey;

    // REQUEST DATA HERE
    let keyToSend = forge.pki.publicKeyToRSAPublicKeyPem(privateKey);
    const reqBody = {
      "serums_id": 235,
      "tags": [
        "all"
      ],
      "hospital_ids": [
        "USTAN"
      ],
      "public_key": keyToSend
    }

    axios.post('http://localhost:5000/smart_patient_health_record/encrypted', reqBody,
      {
        headers: getHeader(jwtAccess)
      }).then(function (response) {
      const dataKey = response.data.key;
      const dataData = response.data.data;
      if (dataKey === null) {
      } else {
        //DECODEKEY:
        const keyToDecode = forge.util.decode64(dataKey);
        const pk = privateKey;
        const md = forge.md.sha256.create();
        const decrypted = pk.decrypt(keyToDecode, 'RSA-OAEP', {
          md: md
        });

        const decodedKey = decrypted;
        const secret = new fernet.Secret(decodedKey);
        const token = new fernet.Token({
          secret: secret,
          token: dataData,
          ttl: 0
        });
        const decryptedMessage = token.decode();
        const newSphr = JSON.parse(decryptedMessage);
        console.log("newSphr", newSphr);
        console.timeEnd("getMedicalData")
      }
    })

  });
};


const medicalStaffRetrievePatientData = (jwtPatient, jwtStaff) => {
  const _createRuleBody = {
    "grantor": {
      "type": "INDIVIDUAL",
      "id": 235
    },
    "grantee": {
      "type": "DEPARTMENT",
      "id": 1,
      "orgId": "USTAN"
    },
    "access": [
      {
        "name": "all"
      }
    ],
    "expires": "2022-07-13T19:55:00.000Z",
    "action": "ALLOW",
    "requestorID": "235"
  }

  const _getAllowTagsBody = {
    "departments": [
      {"id": 1, "org": "USTAN"}
    ],
    "granteeID": "211",
    "grantorID": "235",
    "userType": "MEDICAL_STAFF"
  }

  console.time("createRule");
  //create the rule:
  _createRule(jwtPatient, _createRuleBody).then(data => {
    console.log(data);
    console.timeEnd("createRule");

    console.time("getDepartment");
    //get department ID:
    _getDepartment(jwtStaff).then(data => {
      console.log(data);
      console.timeEnd("getDepartment");


      console.time("getAllowTagsBody");
      // get Allowed tag.
      _getAllowTags(jwtStaff, _getAllowTagsBody).then(data => {
        console.log(data);
        console.timeEnd("getAllowTagsBody");

        console.time("getMedicalData");
        //get the encrypted data and decrypted it
        requestEncryptedSPHR(jwtStaff)


      });// _getAllowTagsBody
    });//_getDepartment
  });//_createRule
}// END OF _getAllowTagsBody


medicalStaffRetrievePatientData(jwtAccess, staffJwtAccess);
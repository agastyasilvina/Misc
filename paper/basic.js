const axios = require('axios');
const forge = require('node-forge');
const fernet = require('fernet');

const jwtAccess = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjUxNjc0NDE0LC" +
  "JqdGkiOiI4Mjc1ZTIxM2VlMTk0NmJhODg3OGUyNDg0ZDY1Y2E4NyIsInVzZXJJRCI6MjM1LCJpc3MiOiJTZXJ1bXNBdXRoZW50aWNhdGlvb" +
  "iIsImlhdCI6MTY0OTA4MjQxNCwic3ViIjoicGF0aWVudDc3N0B1c3Rhbi5jb20iLCJncm91cElEcyI6WyJQQVRJRU5UIl0sIm9yZ0lEIjoi" +
  "VVNUQU4iLCJkZXB0SUQiOm51bGwsImRlcHROYW1lIjpudWxsLCJzdGFmZklEIjpudWxsLCJuYW1lIjpudWxsLCJhdWQiOiJodHRwczovL3No" +
  "Y3Muc2VydW1zLmNzLnN0LWFuZHJld3MuYWMudWsvIn0.3uSd55wPpU41brPodga-1KNboLNFbiuxJ-aidTmeIAU"
const getHeader = () => {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + jwtAccess,
  }
}

const REQ_BODY = {
  "serums_id": 235,
  "tags": [
    "all"
  ],
  "hospital_ids": [
    "USTAN"
  ]
}

console.time("no_encryption")
const no_encryption = () => {
  axios.post('http://localhost:5000/smart_patient_health_record/get_sphr', REQ_BODY,
    {
      headers: getHeader()
    }).then(function (response) {
    console.log(response.data);
    console.timeEnd("no_encryption")
  })
    .catch(function (error) {
      console.log("error?")
    })
    .then(function () {
    });
}
no_encryption()

const requestEncryptedSPHR = () => {
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
        headers: getHeader()
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
        console.timeEnd("With encryption")
      }
    })

  });
};

console.time("With encryption")
requestEncryptedSPHR()
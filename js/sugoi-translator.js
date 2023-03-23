const fetch = require('node-fetch');


async function translate(text){
  const data = {
    "content": text,
    "message": "translate sentence"
  }
  return await fetch("https://translation-server-proxy-erzx8.ondigitalocean.app/", {
    body: JSON.stringify(data),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  }).then(res => res.json())
}

module.exports = translate;
'use strict';

async function post(url, data, returnJSON = false) {
  // Posts data (an object) in JSON format to URL and returns JSON or text
  let response = await fetch (url, {
    method: "post",
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(data)
  })
  if (returnJSON === true) {
    return response.json()
  } else {
    return response.text()
  }
}

async function approve(email) {
  try {
    const confirmMessage = "APPROVE registration for: \n" + email
    if (confirm(confirmMessage) == true) {
      let data = {email: email}
      let response = await post('/approve', data)
      if (response == 'OK') {
        location.reload(true)
      } else {
        throw new Error(response)
      }
    }
  } catch (err) {
    alert('Error: ' + err.message)
  }
}

async function remove(email) {
  try {
    const confirmMessage = "REMOVE registration for: \n" + email
    if (confirm(confirmMessage) == true) {
      let data = {email: email}
      let response = await post('/remove', data)
      if (response == 'OK') {
        location.reload(true)
      } else {
        throw new Error(response)
      }
    }
  } catch (err) {
    alert('Error: ' + err.message)
  }
}

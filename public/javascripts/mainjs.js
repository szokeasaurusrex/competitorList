function approve(email) {
  const confirmMessage = "APPROVE registration for: \n" + email
  if (confirm(confirmMessage) == true) {
    data = {email: email}
    $.post('/approve', data).done(response => {
      if (response == 'OK') {
        location.reload(true)
      } else {
        alert('Error: ' + response)
      }
    }).fail((xhr, status, error) => {
      alert(`Error:\nStatus code: ${status}\nError message: ${error.message}`)
    })
  }
}

function remove(email) {
  const confirmMessage = "REMOVE registration for: \n" + email
  if (confirm(confirmMessage) == true) {
    data = {email: email}
    $.post('/remove', data).done(response => {
      if (response == 'OK') {
        location.reload(true)
      } else {
        alert('Error: ' + response)
      }
    }).fail((xhr, status, error) => {
      alert(`Error:\nStatus code: ${status}\nError message: ${error.message}`)
    })
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const usernameField = document.getElementById("username");
  const passwordField = document.getElementById("password");
  const submitButton = document.getElementById("submitButton");

  usernameField.addEventListener("input", checkInputs);
  passwordField.addEventListener("input", checkInputs);

  function checkInputs() {
    if (
      usernameField.value.trim() !== "" &&
      passwordField.value.trim() !== ""
    ) {
      submitButton.removeAttribute("disabled");
    } else {
      submitButton.setAttribute("disabled", true);
    }
  }
});

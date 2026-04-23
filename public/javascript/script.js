document.addEventListener("DOMContentLoaded", function () {
  'use strict';

  // Fetch all forms
  var forms = document.querySelectorAll('.needs-validation');

  console.log("Forms found:", forms.length); // debug

  Array.prototype.slice.call(forms)
    .forEach(function (form) {

      form.addEventListener('submit', function (event) {

        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
          console.log("Form blocked ❌");
        } else {
          console.log("Form valid ✅");
        }

        form.classList.add('was-validated');

      }, false);

    });
});
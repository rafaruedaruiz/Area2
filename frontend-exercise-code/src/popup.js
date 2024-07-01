import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";


document.addEventListener('DOMContentLoaded', () => {
  const logContentElement = document.getElementById('logContent');
  const noLogsElement = document.getElementById('noLogs');
  const userIdElement = document.getElementById('userId');
  const appContextElement = document.getElementById('appContext');
  const typedTextElement = document.getElementById('typedText');
  const timeToWriteElement = document.getElementById('timeToWrite');
  const topKeysElement = document.getElementById('topKeys');
  const timeZoneElement = document.getElementById('timeZone');
  const startUnixTimeElement = document.getElementById('startUnixTime');
  const pressTimesElement = document.getElementById('pressTimes');
  const releaseTimesElement = document.getElementById('releaseTimes');
  const mouseMovementsElement = document.getElementById('mouseMovements');
  const toggleDetailsButton = document.getElementById('toggleDetailsButton');
  const detailsElement = document.getElementById('details');
  const loginButton = document.getElementById('loginButton');
  const emailElement = document.getElementById('email');
  const passwordElement = document.getElementById('password');
  const logoutButton = document.getElementById('logoutButton')

  const firebaseConfig = {
    apiKey: "AIzaSyASTSU5s2S7wXi-AZH4YOrq1VtAsndsP18",
    authDomain: "area2-435a1.firebaseapp.com",
    projectId: "area2-435a1",
    storageBucket: "area2-435a1.appspot.com",
    messagingSenderId: "1026370088893",
    appId: "1:1026370088893:web:7add6ab8b2fce27eaa2cd4",
    measurementId: "G-FTWN5K807S"
  };
  
   // Initialize Firebase
   const app = initializeApp(firebaseConfig);
   const auth = getAuth(app);

   let userLoged = false;
   let userLogedId = "";

   // Dependiendo si hay usuario logueado en localstorage o no, muestra sus funcionalidades correspondientes
   chrome.storage.local.get(['isLoggedIn', 'userEmail', 'userId'], function(data) {
    if (data.isLoggedIn) {
      userLoged = true;
      userLogedId = data.userId;
      document.getElementById('loginForm').style.display = 'none';
      document.getElementById('logoutForm').style.display = 'block';
      logContentElement.classList.remove('hidden')
      document.getElementById('userEmailLogout').style.display = 'block';
      document.getElementById('userEmailLogout').textContent = data.userEmail; 
    }else{
      userLoged = false;
      userLogedId = "";
      document.getElementById('loginForm').style.display = 'block';
      document.getElementById('logoutForm').style.display = 'none';
      logContentElement.classList.add('hidden');
      document.getElementById('userEmailLogout').style.display = 'none';
    }
  });

  // Función para formatear tiempos Unix a solo la hora
  function formatTime(unixTime) {
    const date = new Date(unixTime);
    return date.toLocaleTimeString();
  }

  // Convertir y mostrar los tiempos en un formato legible
  function displayTimes(times) {
    return times.map(time => formatTime(time)).join(', ');
  }

  // Calcular el tiempo total en segundos desde la primera tecla presionada hasta la última tecla liberada
  function calculateTimeToWrite(pressTimes, releaseTimes) {
    if (pressTimes.length === 0 || releaseTimes.length === 0) return "N/A";
    const startTime = Math.min(...pressTimes);
    const endTime = Math.max(...releaseTimes);
    return ((endTime - startTime) / 1000).toFixed(2);
  }

  // Calcular las teclas más pulsadas
  function getTopKeys(keys) {
    const frequency = keys.reduce((acc, key) => {
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([key, count]) => `${key}: ${count}`)
      .join(', ');
  }

  // Función para formatear el timeZone a un formato legible
  function formatTimeZone(timeZone) {
    return `GMT${timeZone >= 0 ? '+' : ''}${timeZone}`;
  }

  // Convertir y mostrar los movimientos del ratón
  function displayMouseMovements(movements) {
    return movements.map(movement => `(${movement.x}, ${movement.y}) at ${formatTime(movement.time)}`).join(', ');
  }

  // Fetch and display log data
  chrome.runtime.sendMessage({ type: 'get_last_log' }, (response) => {
    if (response && response.data && response.data.text.length > 0 && userLoged) {
      const data = response.data;
      userIdElement.textContent = userLogedId;
      appContextElement.textContent = data.appContext;
      typedTextElement.textContent = data.text.join('');
      timeToWriteElement.textContent = calculateTimeToWrite(data.pressTimes, data.releaseTimes);
      topKeysElement.textContent = getTopKeys(data.keyTypes);
      timeZoneElement.textContent = formatTimeZone(data.timeZone);
      startUnixTimeElement.textContent = formatTime(data.startUnixTime);
      pressTimesElement.textContent = displayTimes(data.pressTimes);
      releaseTimesElement.textContent = displayTimes(data.releaseTimes);
      mouseMovementsElement.textContent = displayMouseMovements(data.mouseMovements);
      logContentElement.classList.remove('hidden');
    } else {
      noLogsElement.classList.add('hidden');
    }
  });

  toggleDetailsButton.addEventListener('click', () => {
    if (detailsElement.classList.contains('hidden')) {
      detailsElement.classList.remove('hidden');
      toggleDetailsButton.textContent = 'Hide Details';
    } else {
      detailsElement.classList.add('hidden');
      toggleDetailsButton.textContent = 'Show More Details';
    }
  });


  loginButton.addEventListener('click', () => {
    const email = emailElement.value;
    const password = passwordElement.value;
    console.log("Email: ", email, "Password: ", password);
  
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Usuario que ha iniciado sesión
        console.log("User logged in: ", userCredential.user);

        // Guardarlo en local storage
        chrome.storage.local.set({userId: userCredential.user.uid, userEmail: userCredential.user.email, isLoggedIn: true}, () => {
          console.log("User ID and login state saved to local storage.");
        });
  
        // Ocultar el formulario de login
        document.getElementById('loginForm').style.display = 'none';

        logContentElement.classList.remove('hidden');
        document.getElementById('userEmailLogout').textContent = userCredential.user.email;  // Mostrar el email del usuario
        document.getElementById('logoutForm').style.display = 'block';  
        document.getElementById('loginError').style.display = 'none';  
      })
      .catch((error) => {    // Mostrar mensaje de error
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("Login error: ", errorCode, errorMessage);

        let userMessage = '';
        switch (errorCode) {
          case 'auth/wrong-password':
            userMessage = 'La contrasena es incorrecta.';
            break;
          case 'auth/user-not-found':
            userMessage = 'No hay registro de usuario correspondiente a este identificador. El usuario puede haber sido eliminado.';
            break;
          case 'auth/weak-password':
            userMessage = 'La contraseña es demasiado debil.';
            break;
          default:
            userMessage = 'Ocurrio un error al intentar iniciar sesion: ' + errorMessage;
        }
  
        const loginErrorDiv = document.getElementById('loginError');
        loginErrorDiv.textContent = userMessage;
        loginErrorDiv.style.display = 'block'; 
      });
  });  

  logoutButton.addEventListener('click', () => {
    signOut(auth).then(() => {
      console.log("User logged out");

      // Borrarlo de local storage
      chrome.storage.local.remove(['userId', 'userEmail', 'isLoggedIn'], () => {
        console.log("User ID and login state cleared from local storage.");
      });

      document.getElementById('logoutForm').style.display = 'none';
      document.getElementById('loginForm').style.display = 'block';
      logContentElement.classList.add('hidden');
    }).catch((error) => {
      console.error("Logout error: ", error);
    });
  });

});

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
    if (response && response.data && response.data.text.length > 0) {
      const data = response.data;
      userIdElement.textContent = data.user_id;
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
      noLogsElement.classList.remove('hidden');
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
});

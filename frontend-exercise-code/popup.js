document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({ type: 'get_last_log' }, (response) => {
    if (response && response.data) {
      document.getElementById('logDisplay').textContent = JSON.stringify(response.data, null, 2);
    } else {
      document.getElementById('logDisplay').textContent = "No logs available.";
    }
  });
});
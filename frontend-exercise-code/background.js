let lastLog = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'log_key') {
    console.log('Received typing data:', message.data);
    lastLog = message.data;
    fetch('http://localhost:3000/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message.data)
    }).then(response => response.json())
      .then(data => {
        console.log('Data sent to server:', data);
        sendResponse({ status: 'success' });
      }).catch(error => {
        console.error('Error sending data to server:', error);
        sendResponse({ status: 'error', message: error });
      });
    return true; // Required to use sendResponse asynchronously
  } else if (message.type === 'get_last_log') {
    sendResponse({ data: lastLog });
  }
});
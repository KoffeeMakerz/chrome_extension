document.getElementById("runTests").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "runTests" });
  });
  
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "log") {
      document.getElementById("log").textContent += msg.data + "\n";
    }
  });
  
import styles from './index.module.css';

export function Index() {
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.css file.
   */

  async function submitQuery() {
    let userInput = document.getElementById("user_input") as HTMLInputElement;
    let messages = document.getElementById("messages");

    const response = await fetch("http://localhost:8079/chatgpt", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({user_input: userInput.value})
    });

    if (response.ok) {
        const jsonResponse = await response.json();
        messages.innerHTML += `<div><strong>You:</strong> ${userInput.value}</div>`;
        messages.innerHTML += `<div><strong>ChatGPT:</strong> ${jsonResponse.response}</div>`;
        userInput.value = ""; // Clear the user input after submitting the request
    }
}


  return (
    <>
      <h1>Polytlk: The ChatGPT</h1>
      <div className="chat-container">
          <div className="messages" id="messages"></div>
          <textarea id="user_input" rows={3} placeholder="Type your query here..."></textarea>
          <div className="submit-container">
              <button onClick={submitQuery}>Submit</button>
          </div>
      </div>
    </>
  );
}

export default Index;

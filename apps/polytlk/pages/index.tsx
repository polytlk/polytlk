import styles from './index.module.css';

export function Index() {
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.css file.
   */
  return (
    <>
      <h1>Polytlk: The ChatGPT</h1>
      <div className="chat-container">
          <div className="messages" id="messages"></div>
          <textarea id="user_input" rows="3" placeholder="Type your query here..."></textarea>
          <div className="submit-container">
              <button onClick="submitQuery()">Submit</button>
          </div>
      </div>
    </>
  );
}

export default Index;

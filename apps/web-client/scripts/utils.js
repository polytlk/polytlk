import { exec } from 'child_process';
import https from 'https';

async function download(url) {
  try {
    const data = await new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          let data = '';

          // A chunk of data has been received.
          res.on('data', (chunk) => {
            data += chunk;
          });

          // The whole response has been received.
          res.on('end', () => {
            resolve(data); // Resolve the promise with the downloaded data
          });

          res.on('error', (err) => {
            reject(err); // Reject the promise on error
          });
        })
        .on('error', (err) => {
          reject(err); // Catch any connection-level errors
        });
    });
    console.log('returning', url);
    return data;
  } catch (error) {
    console.log('failed', url);
  }
}

async function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        reject(error); // Reject the promise on error
        return;
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        reject(new Error(stderr)); // Reject if there is stderr output
        return;
      }

      console.log(`stdout: ${stdout}`);
      resolve(stdout); // Resolve the promise on success
    });
  });
}

export { download, runCommand };

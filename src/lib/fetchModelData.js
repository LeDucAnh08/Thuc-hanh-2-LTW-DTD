/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 */
function fetchModel(url) {
  return fetch(`https://7xxj88-3001.csb.app${url}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('Fetch error:', error);
      throw error;
    });
}

export default fetchModel;

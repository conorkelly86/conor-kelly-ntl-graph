import NetlifyGraph from "../../lib/netlifyGraph";

export const handler = async (req, res) => {
  // By default, all API calls use no authentication
  let accessToken = null;

  //// If you want to use the client's accessToken when making API calls on the user's behalf:
  accessToken = req.headers["authorization"]?.split(" ")[1];

  //// If you want to use the API with your own access token:
  // accessToken = process.env.ONEGRAPH_AUTHLIFY_TOKEN;

  const eventBodyJson = req.body || {};

  const trackIds = eventBodyJson?.trackIds;

  if (trackIds === undefined || trackIds === null) {
    return res.status(422).json({
      errors: ["You must supply parameters for: `trackIds`"],
    });
  }

  const { errors, data } = await NetlifyGraph.executePlaySong(
    { trackIds: trackIds },
    { accessToken: accessToken }
  );

  if (errors) {
    console.error(JSON.stringify(errors, null, 2));
  }

  console.log(JSON.stringify(data, null, 2));

  res.setHeader("Content-Type", "application/json");

  return res.status(200).json({
    errors,
    data,
  });
};

export default handler;

/**
 * Client-side invocations:
 * Call your Netlify function from the browser with this helper:
 */

/**
async function executePlaySong(netlifyGraphAuth, params) {
  const {trackIds} = params || {};
  const resp = await fetch(`/api/PlaySong`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    ...netlifyGraphAuth?.authHeaders()
    },
    body: JSON.stringify({"trackIds": trackIds})
  });

  const text = await resp.text();

  return JSON.parse(text);
}
*/
